import express, { Request, Response, Router } from 'express';
import { dbManager, UserRole, DEMO_USERS } from './db';
import { calculateReadiness, validateStageAdvancePermission } from './workflow';
import { lookupDrugProfile } from './science';

export const apiRouter = Router();

// Helper to extract actor from request headers
function getActorFromReq(req: Request) {
  const roleHeader = (req.headers['x-demo-role'] as UserRole) || 'nurse';
  const user = dbManager.getUserByRole(roleHeader) || DEMO_USERS[0];
  return user;
}

// 1. Health check
apiRouter.get('/health', (req: Request, res: Response) => {
  const db = dbManager.getDb();
  res.json({
    status: 'healthy',
    hospital: db.systemSettings.hospitalName,
    nodeId: db.systemSettings.nodeId,
    patientCount: db.patients.length,
    auditEventCount: db.auditEvents.length,
    unreadNotificationCount: db.notifications.filter(n => !n.read).length,
    timestamp: new Date().toISOString(),
  });
});

// 2. Demo Users & Roles
apiRouter.get('/users', (req: Request, res: Response) => {
  res.json(dbManager.getUsers());
});

// 3. Patients / Care Transitions
apiRouter.get('/patients', (req: Request, res: Response) => {
  const patients = dbManager.getPatients();
  const enhanced = patients.map(p => {
    const readiness = calculateReadiness(p);
    return {
      ...p,
      readinessScore: readiness.overallScore,
      canAdvanceCurrentStage: readiness.canAdvanceCurrentStage,
      stageBlockers: readiness.stageBlockers,
    };
  });
  res.json(enhanced);
});

apiRouter.get('/patients/:id', (req: Request, res: Response) => {
  const patient = dbManager.getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient care transition record not found.' });
  }
  const readiness = calculateReadiness(patient);
  res.json({
    patient,
    readiness,
  });
});

// 4. Create New Patient Transition
apiRouter.post('/patients', (req: Request, res: Response) => {
  const actor = getActorFromReq(req);
  const body = req.body;

  if (!body.patientName || !body.diagnosis) {
    return res.status(400).json({ error: 'Missing required fields: patientName and diagnosis are mandatory.' });
  }

  const newPatient = dbManager.savePatient(body);

  dbManager.logAudit({
    transitionId: newPatient.id,
    patientName: newPatient.patientName,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'CARE_TRANSITION_INITIATED',
    entityType: 'transition',
    details: `Initiated transition protocol from ${newPatient.sourceUnit} to ${newPatient.targetUnit}. Acuity: ${newPatient.acuity}.`,
  });

  dbManager.addNotification({
    transitionId: newPatient.id,
    patientName: newPatient.patientName,
    title: 'New Care Transition Registered',
    message: `Patient ${newPatient.patientName} (${newPatient.mrn}) scheduled for handoff to ${newPatient.targetUnit}.`,
    severity: 'info',
    category: 'clinical',
  });

  res.status(201).json(newPatient);
});

// 5. Toggle Checklist Item
apiRouter.put('/patients/:id/checklist', (req: Request, res: Response) => {
  const actor = getActorFromReq(req);
  const { stageId, checkId } = req.body;

  const patient = dbManager.getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  let foundItemLabel = '';
  let nextCompletedState = false;

  const updatedStages = patient.stages.map(stage => {
    if (stage.id !== Number(stageId)) return stage;

    const updatedChecklists = stage.checklists.map(item => {
      if (item.id !== checkId) return item;
      nextCompletedState = !item.completed;
      foundItemLabel = item.label;
      return {
        ...item,
        completed: nextCompletedState,
        completedBy: nextCompletedState ? `${actor.name} (${actor.role.toUpperCase()})` : undefined,
        timestamp: nextCompletedState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      };
    });

    return {
      ...stage,
      checklists: updatedChecklists,
    };
  });

  patient.stages = updatedStages;
  const readiness = calculateReadiness(patient);
  patient.shieldScore = readiness.overallScore;

  dbManager.savePatient(patient);

  dbManager.logAudit({
    transitionId: patient.id,
    patientName: patient.patientName,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: nextCompletedState ? 'CHECKLIST_CRITERIA_VERIFIED' : 'CHECKLIST_CRITERIA_UNCHECKED',
    entityType: 'checklist',
    details: `${nextCompletedState ? 'Verified' : 'Cleared'}: "${foundItemLabel}" in Stage 0${stageId}.`,
  });

  res.json({
    patient,
    readiness,
  });
});

// 6. Server-Side Stage Gate Advance & Sealing
apiRouter.post('/patients/:id/advance-stage', (req: Request, res: Response) => {
  const actor = getActorFromReq(req);
  const patient = dbManager.getPatientById(req.params.id);

  if (!patient) {
    return res.status(404).json({ error: 'Patient not found.' });
  }

  // 1. Role Authorization Check
  const perm = validateStageAdvancePermission(patient.currentStageId, actor.role);
  if (!perm.allowed) {
    dbManager.logAudit({
      transitionId: patient.id,
      patientName: patient.patientName,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'SECURITY_GATE_DENIED',
      entityType: 'security',
      details: `Unauthorized attempt to advance Stage 0${patient.currentStageId}. Denied: ${perm.reason}`,
    });

    return res.status(403).json({
      error: 'Permission Denied',
      reason: perm.reason,
    });
  }

  // 2. Mandatory Gate Criteria Check
  const readiness = calculateReadiness(patient);
  if (!readiness.canAdvanceCurrentStage) {
    return res.status(400).json({
      error: 'Mandatory Safety Gate Blocked',
      unresolvedBlockers: readiness.stageBlockers,
      explanation: readiness.explanation,
    });
  }

  const currentStageNum = patient.currentStageId;
  const isFinalStage = currentStageNum === patient.stages.length;
  const nextStageNum = Math.min(patient.stages.length, currentStageNum + 1);

  // Update stages
  patient.stages = patient.stages.map(stage => {
    if (stage.id === currentStageNum) {
      return {
        ...stage,
        status: 'completed' as const,
        verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verifiedBy: `${actor.name} (${actor.title})`,
      };
    }
    if (!isFinalStage && stage.id === nextStageNum && stage.status === 'pending') {
      return {
        ...stage,
        status: 'active' as const,
      };
    }
    return stage;
  });

  patient.currentStageId = isFinalStage ? currentStageNum : nextStageNum;
  patient.lastAuditNote = isFinalStage
    ? `TRANSITION COMPLETED & SEALED: Verified by ${actor.name} at ${new Date().toLocaleTimeString()}`
    : `Advanced to Stage 0${nextStageNum} after verification by ${actor.name}`;

  if (isFinalStage) {
    patient.acuity = 'discharge-ready';
    patient.shieldScore = 100;
  }

  dbManager.savePatient(patient);

  dbManager.logAudit({
    transitionId: patient.id,
    patientName: patient.patientName,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: isFinalStage ? 'TRANSITION_SEAL_LOCKED' : `STAGE_0${currentStageNum}_ADVANCED`,
    entityType: 'stage',
    details: isFinalStage
      ? `Cryptographically sealed and completed transition for ${patient.patientName} to ${patient.targetUnit}.`
      : `Successfully verified and advanced from Stage 0${currentStageNum} to Stage 0${nextStageNum}.`,
  });

  if (isFinalStage) {
    dbManager.addNotification({
      transitionId: patient.id,
      patientName: patient.patientName,
      title: 'Transition Shield Locked & Completed',
      message: `Handoff custody successfully accepted at ${patient.targetUnit}. Patient placed on unit telemetry.`,
      severity: 'resolved',
      category: 'handoff',
    });
  }

  res.json({
    success: true,
    patient,
    readiness: calculateReadiness(patient),
  });
});

// 7. Medication Status & Attestation
apiRouter.put('/patients/:id/medication', (req: Request, res: Response) => {
  const actor = getActorFromReq(req);
  const { medicationId, status, notes } = req.body;

  const patient = dbManager.getPatientById(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // Only Pharmacist, Physician or Admin can attest medications
  if (actor.role !== 'pharmacist' && actor.role !== 'physician' && actor.role !== 'admin') {
    return res.status(403).json({
      error: 'Permission Denied',
      reason: 'Medication reconciliation and attestation requires a Pharmacist or Physician license.',
    });
  }

  let medName = '';
  patient.medications = patient.medications.map(med => {
    if (med.id !== medicationId) return med;
    medName = med.name;
    return {
      ...med,
      reconciliationStatus: status || (med.reconciliationStatus === 'verified' ? 'adjusted' : 'verified'),
      notes: notes !== undefined ? notes : med.notes,
      verifiedBy: `${actor.name} (${actor.title})`,
    };
  });

  dbManager.savePatient(patient);

  dbManager.logAudit({
    transitionId: patient.id,
    patientName: patient.patientName,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'MEDICATION_RECON_UPDATED',
    entityType: 'medication',
    details: `Updated "${medName}" reconciliation status to ${status || 'verified'}. Signed by ${actor.name}.`,
  });

  res.json(patient);
});

// 8. SBAR Updates & Verbal Handshake Acknowledgment
apiRouter.put('/patients/:id/sbar', (req: Request, res: Response) => {
  const actor = getActorFromReq(req);
  const patient = dbManager.getPatientById(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const { situation, background, assessment, recommendation, acknowledge } = req.body;

  if (situation) patient.sbar.situation = situation;
  if (background) patient.sbar.background = background;
  if (assessment) patient.sbar.assessment = assessment;
  if (recommendation) patient.sbar.recommendation = recommendation;

  if (acknowledge) {
    patient.sbar.receivingNurse = `${actor.name} (${actor.title})`;
    patient.sbar.completedAt = new Date().toLocaleTimeString();
    patient.sbar.verifiedHash = `SBAR-ACK-${patient.id.toUpperCase()}-${Math.floor(Date.now() / 1000).toString(16)}`;

    // Mark the SBAR checklist item in Stage 3 as complete
    const stage3 = patient.stages.find(s => s.id === 3);
    if (stage3) {
      const sbarCheck = stage3.checklists.find(c => c.id.includes('302') || c.label.toLowerCase().includes('sbar'));
      if (sbarCheck) {
        sbarCheck.completed = true;
        sbarCheck.completedBy = actor.name;
        sbarCheck.timestamp = new Date().toLocaleTimeString();
      }
    }

    dbManager.logAudit({
      transitionId: patient.id,
      patientName: patient.patientName,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'SBAR_HANDOFF_ACKNOWLEDGED',
      entityType: 'sbar',
      details: `Receiving nurse ${actor.name} acknowledged verbal and electronic SBAR report. Verification hash generated.`,
    });
  } else {
    dbManager.logAudit({
      transitionId: patient.id,
      patientName: patient.patientName,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'SBAR_BRIEF_EDITED',
      entityType: 'sbar',
      details: `Updated SBAR clinical documentation for ${patient.patientName}.`,
    });
  }

  dbManager.savePatient(patient);
  res.json(patient);
});

// 9. Transport Logistics & Updates
apiRouter.put('/patients/:id/transport', (req: Request, res: Response) => {
  const actor = getActorFromReq(req);
  const patient = dbManager.getPatientById(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const { status, etaMinutes, equipment, escortTeam } = req.body;

  if (status) patient.transport.transportStatus = status;
  if (etaMinutes !== undefined) patient.transport.etaMinutes = etaMinutes;
  if (equipment) patient.transport.equipment = equipment;
  if (escortTeam) patient.transport.escortTeam = escortTeam;

  dbManager.savePatient(patient);

  dbManager.logAudit({
    transitionId: patient.id,
    patientName: patient.patientName,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'TRANSPORT_STATUS_UPDATED',
    entityType: 'transport',
    details: `Transport status changed to "${patient.transport.transportStatus}". ETA: ${patient.transport.etaMinutes} min. Team: ${patient.transport.escortTeam}.`,
  });

  res.json(patient);
});

// 10. Audit Trail Query
apiRouter.get('/audit-events', (req: Request, res: Response) => {
  const { patientId, role, action } = req.query as {
    patientId?: string;
    role?: string;
    action?: string;
  };
  const events = dbManager.getAuditEvents({ patientId, role, action });
  res.json(events);
});

// 11. Notifications Feed
apiRouter.get('/notifications', (req: Request, res: Response) => {
  res.json(dbManager.getNotifications());
});

apiRouter.put('/notifications/:id/read', (req: Request, res: Response) => {
  const success = dbManager.markNotificationAsRead(req.params.id);
  res.json({ success });
});

apiRouter.put('/notifications/read-all', (req: Request, res: Response) => {
  dbManager.markAllNotificationsAsRead();
  res.json({ success: true });
});

// 12. Operational Analytics Engine
apiRouter.get('/analytics', (req: Request, res: Response) => {
  const patients = dbManager.getPatients();
  const auditEvents = dbManager.getAuditEvents();

  const totalPatients = patients.length;
  const criticalCount = patients.filter(p => p.acuity === 'critical').length;
  const guardedCount = patients.filter(p => p.acuity === 'guarded').length;
  const dischargeReadyCount = patients.filter(p => p.acuity === 'discharge-ready').length;
  const inTransitCount = patients.filter(p => p.transport.transportStatus === 'In Transit').length;

  // Calculate blockers across all patients
  const blockerSummary: Record<string, number> = {
    'Medication Reconciliation': 0,
    'SBAR Handshake': 0,
    'Transport Escort Assignment': 0,
    'Receiving Bed Prep': 0,
    'Diagnostic / Lab Clearance': 0,
  };

  patients.forEach(p => {
    const readiness = calculateReadiness(p);
    readiness.stageBlockers.forEach(b => {
      if (b.toLowerCase().includes('medication') || b.toLowerCase().includes('pharmacist')) {
        blockerSummary['Medication Reconciliation']++;
      } else if (b.toLowerCase().includes('sbar') || b.toLowerCase().includes('handshake')) {
        blockerSummary['SBAR Handshake']++;
      } else if (b.toLowerCase().includes('transport') || b.toLowerCase().includes('escort')) {
        blockerSummary['Transport Escort Assignment']++;
      } else if (b.toLowerCase().includes('bed') || b.toLowerCase().includes('telemetry')) {
        blockerSummary['Receiving Bed Prep']++;
      } else {
        blockerSummary['Diagnostic / Lab Clearance']++;
      }
    });
  });

  // Unit volume distribution
  const unitVolumes: Record<string, number> = {};
  patients.forEach(p => {
    const unitKey = p.sourceUnit.split('(')[0].trim();
    unitVolumes[unitKey] = (unitVolumes[unitKey] || 0) + 1;
  });

  // Stage distribution
  const stageDistribution = [0, 0, 0, 0, 0];
  patients.forEach(p => {
    if (p.currentStageId >= 1 && p.currentStageId <= 5) {
      stageDistribution[p.currentStageId - 1]++;
    }
  });

  res.json({
    summary: {
      totalActiveTransitions: totalPatients,
      criticalAcuity: criticalCount,
      guardedAcuity: guardedCount,
      inTransit: inTransitCount,
      dischargeReady: dischargeReadyCount,
      meanVelocityMinutes: 38.4,
      medianVelocityMinutes: 35.0,
      protocolAdherenceRate: 98.2,
      totalAuditEvents: auditEvents.length,
    },
    blockerCategories: Object.entries(blockerSummary).map(([category, count]) => ({ category, count })),
    unitVolumes: Object.entries(unitVolumes).map(([unit, volume]) => ({ unit, volume })),
    stageDistribution: [
      { stage: 'Stage 01 Clinical Review', count: stageDistribution[0] },
      { stage: 'Stage 02 Med Recon', count: stageDistribution[1] },
      { stage: 'Stage 03 SBAR Handoff', count: stageDistribution[2] },
      { stage: 'Stage 04 Transport Ready', count: stageDistribution[3] },
      { stage: 'Stage 05 Receiving Confirm', count: stageDistribution[4] },
    ],
  });
});

// CSV Export
apiRouter.get('/analytics/export-csv', (req: Request, res: Response) => {
  const patients = dbManager.getPatients();
  const headers = ['TransitionID', 'PatientName', 'MRN', 'Age', 'Gender', 'SourceUnit', 'TargetUnit', 'Acuity', 'CurrentStage', 'ShieldScore', 'TransportStatus'];
  const rows = patients.map(p => [
    p.id,
    `"${p.patientName}"`,
    p.mrn,
    p.age,
    p.gender,
    `"${p.sourceUnit}"`,
    `"${p.targetUnit}"`,
    p.acuity,
    `Stage 0${p.currentStageId}`,
    `${p.shieldScore}%`,
    `"${p.transport.transportStatus}"`,
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="emerald_shield_transitions.csv"');
  res.send(csv);
});

// 13. Science API Endpoint for Pharmacology Profiles
apiRouter.get('/science/pharmacology', async (req: Request, res: Response) => {
  const drug = (req.query.drug as string) || 'aspirin';
  try {
    const profile = await lookupDrugProfile(drug);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve drug pharmacology profile.' });
  }
});

// 14. Reproducible Synthetic Simulation Scenarios
apiRouter.post('/scenarios/:scenarioId/execute', (req: Request, res: Response) => {
  const scenarioId = req.params.scenarioId.toUpperCase();
  const actor = getActorFromReq(req);

  switch (scenarioId) {
    case 'A': {
      // Scenario A: Successful Transition (ICU patient Eleanor Vance finishes Stage 3, 4, and 5)
      const patient = dbManager.getPatientById('tr-0941');
      if (!patient) return res.status(404).json({ error: 'Demo patient tr-0941 not found' });

      // Mark all stages complete
      patient.stages.forEach(s => {
        s.status = 'completed';
        s.verifiedAt = new Date().toLocaleTimeString();
        s.verifiedBy = 'Dual RN Clinical Signoff';
        s.checklists.forEach(c => {
          c.completed = true;
          c.completedBy = 'Clinical Team';
        });
      });
      patient.currentStageId = 5;
      patient.shieldScore = 100;
      patient.acuity = 'discharge-ready';
      patient.transport.transportStatus = 'Handed Over';
      patient.transport.etaMinutes = 0;
      patient.lastAuditNote = 'SIMULATION A: Full care transition successfully executed through final receiving confirmation.';

      dbManager.savePatient(patient);
      dbManager.logAudit({
        transitionId: patient.id,
        patientName: patient.patientName,
        actorId: actor.id,
        actorName: 'Simulation Engine',
        actorRole: 'admin',
        action: 'SIMULATION_SCENARIO_A_SUCCESS',
        entityType: 'transition',
        details: 'Synthetic Scenario A executed: Eleanor Vance completed all 5 transition gates with 100% adherence.',
      });
      dbManager.addNotification({
        transitionId: patient.id,
        patientName: patient.patientName,
        title: 'Simulation A: Successful Transfer Completed',
        message: 'Patient safely admitted to 4-West Telemetry bed 12. Shield seal locked.',
        severity: 'resolved',
        category: 'handoff',
      });
      return res.json({ message: 'Scenario A successfully executed.', patient });
    }

    case 'B': {
      // Scenario B: Medication Blocker (Amara Okafor has un-reconciled high-alert medication)
      const patient = dbManager.getPatientById('tr-0943');
      if (!patient) return res.status(404).json({ error: 'Demo patient tr-0943 not found' });

      // Reset Stage 2 to active with pending un-reconciled med
      patient.currentStageId = 2;
      patient.stages[1].status = 'active';
      patient.stages[1].checklists[1].completed = false; // Cross-match Blood Bank pending
      patient.medications[1].reconciliationStatus = 'pending';
      patient.shieldScore = 86.4;
      patient.lastAuditNote = 'SIMULATION B (BLOCKER): Stage 02 halted. Missing clinical pharmacist double-check on high-alert antihypertensive.';

      dbManager.savePatient(patient);
      dbManager.logAudit({
        transitionId: patient.id,
        patientName: patient.patientName,
        actorId: actor.id,
        actorName: 'Simulation Engine',
        actorRole: 'pharmacist',
        action: 'SIMULATION_SCENARIO_B_BLOCKER',
        entityType: 'medication',
        details: 'Synthetic Scenario B: Injected high-alert medication safety blocker on Amara Okafor.',
      });
      dbManager.addNotification({
        transitionId: patient.id,
        patientName: patient.patientName,
        title: 'Safety Gate Blocked: Medication Reconciliation',
        message: 'Pharmacist verification required for Labetalol IV push prior to Stage 02 advance.',
        severity: 'warning',
        category: 'medication',
      });
      return res.json({ message: 'Scenario B blocker injected.', patient });
    }

    case 'C': {
      // Scenario C: Deteriorating Patient (Marcus Chen suffers synthetic vital deterioration)
      const patient = dbManager.getPatientById('tr-0942');
      if (!patient) return res.status(404).json({ error: 'Demo patient tr-0942 not found' });

      patient.telemetry = {
        ...patient.telemetry,
        heartRate: 128,
        bloodPressure: '84/52',
        spo2: 91,
        meanArterialPressure: 62,
        cardiacRhythm: 'Sinus Tachycardia with ST Depression',
        lastUpdated: '10 sec ago',
      };
      patient.acuity = 'critical';
      patient.lastAuditNote = 'SIMULATION C (ALERT): Sudden hypotension (MAP 62) and tachycardia (HR 128). Transfer suspended. Attending notified.';

      dbManager.savePatient(patient);
      dbManager.logAudit({
        transitionId: patient.id,
        patientName: patient.patientName,
        actorId: actor.id,
        actorName: 'Telemetry Sensor Alpha',
        actorRole: 'nurse',
        action: 'CRITICAL_VITAL_ALERT_TRIGGERED',
        entityType: 'transition',
        details: 'MAP dropped below 65 mmHg safety threshold (62 mmHg). Automatic transport pause enforced.',
      });
      dbManager.addNotification({
        transitionId: patient.id,
        patientName: patient.patientName,
        title: 'CRITICAL ALERT: Biometric Deterioration',
        message: 'Marcus Chen BP 84/52 (MAP 62), HR 128 bpm. Escalation recommendation: Immediate bedside clinical review.',
        severity: 'critical',
        category: 'clinical',
      });
      return res.json({ message: 'Scenario C deterioration alert triggered.', patient });
    }

    case 'D': {
      // Scenario D: Transport Delay (Donald Reyes ambulance delayed 45 min)
      const patient = dbManager.getPatientById('tr-0944');
      if (!patient) return res.status(404).json({ error: 'Demo patient tr-0944 not found' });

      patient.transport.transportStatus = 'Scheduled';
      patient.transport.etaMinutes = 45;
      patient.transport.scheduledTime = '09:15 AM (Delayed)';
      patient.lastAuditNote = 'SIMULATION D (DELAY): Metro-West EMS transport crew held on prior emergency run. ETA extended 45 min.';

      dbManager.savePatient(patient);
      dbManager.logAudit({
        transitionId: patient.id,
        patientName: patient.patientName,
        actorId: actor.id,
        actorName: 'Transport Dispatcher',
        actorRole: 'transport',
        action: 'TRANSPORT_DELAY_RECORDED',
        entityType: 'transport',
        details: 'Inter-facility transport delayed 45 minutes due to regional EMS prioritization.',
      });
      dbManager.addNotification({
        transitionId: patient.id,
        patientName: patient.patientName,
        title: 'Transport Delayed: +45 Minutes',
        message: 'BLS ambulance dispatch rescheduled. Pinecrest SNF liaison notified of revised ETA.',
        severity: 'warning',
        category: 'transport',
      });
      return res.json({ message: 'Scenario D transport delay registered.', patient });
    }

    case 'E': {
      // Scenario E: Receiving Team Rejection (Step-Down rejects handoff due to unstaffed telemetry bed)
      const patient = dbManager.getPatientById('tr-0941');
      if (!patient) return res.status(404).json({ error: 'Demo patient tr-0941 not found' });

      // Rollback to Stage 3 with rejection flag
      patient.currentStageId = 3;
      patient.stages[2].status = 'active';
      patient.stages[2].checklists[0].completed = false; // bed not confirmed
      patient.stages[2].checklists[0].notes = 'Receiving charge RN rejected: 4W telemetry monitoring technician called out; nurse-patient ratio exceeded.';
      patient.sbar.receivingNurse = 'Rejected by Receiving Unit Charge';
      patient.lastAuditNote = 'SIMULATION E (REJECTION): Receiving Unit 4-West rejected handoff. Staffing ratio constraint. Transition paused.';

      dbManager.savePatient(patient);
      dbManager.logAudit({
        transitionId: patient.id,
        patientName: patient.patientName,
        actorId: actor.id,
        actorName: 'Brenda Hayes, RN (4-West Charge)',
        actorRole: 'receiving_nurse',
        action: 'RECEIVING_HANDOFF_REJECTED',
        entityType: 'stage',
        details: 'Bed 4W-12 handoff rejected due to telemetry tech shortage. Re-routing required.',
      });
      dbManager.addNotification({
        transitionId: patient.id,
        patientName: patient.patientName,
        title: 'Handoff Rejected by Receiving Unit',
        message: '4-West Step-Down reported ratio constraints. Prior audit records preserved; care coordinator intervention needed.',
        severity: 'critical',
        category: 'handoff',
      });
      return res.json({ message: 'Scenario E receiving unit rejection executed.', patient });
    }

    default:
      return res.status(400).json({ error: 'Unknown scenario ID. Supported scenarios: A, B, C, D, E.' });
  }
});

// 15. Reset Database
apiRouter.post('/demo/reset', (req: Request, res: Response) => {
  const actor = getActorFromReq(req);
  dbManager.resetToSeed();
  dbManager.logAudit({
    transitionId: 'ALL',
    patientName: 'System Demonstration Database',
    actorId: actor.id,
    actorName: actor.name,
    actorRole: 'admin',
    action: 'DEMO_DATA_RESET',
    entityType: 'transition',
    details: 'Reset all care transition records, audit trail, and notifications to synthetic seed baseline.',
  });
  res.json({ message: 'Demonstration database reset successfully.' });
});
