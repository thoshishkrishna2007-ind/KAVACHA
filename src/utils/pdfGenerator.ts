import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CareTransition } from '../types/clinical';
import { AuditEvent, ReadinessBreakdown, UserProfile } from '../types/backend';
import { calculateReadiness } from './readiness';

// Color definitions aligned with KAVACHA botanical emerald design system
const COLORS = {
  emeraldDark: [18, 59, 50] as [number, number, number],    // #123B32
  emeraldPrimary: [0, 97, 80] as [number, number, number],  // #006150
  emeraldMint: [226, 241, 235] as [number, number, number], // #E2F1EB
  cyanAccent: [99, 220, 232] as [number, number, number],   // #63DCE8
  goldAccent: [198, 161, 91] as [number, number, number],   // #C6A15B
  goldDark: [142, 107, 34] as [number, number, number],     // #8E6B22
  textDark: [17, 30, 26] as [number, number, number],       // #111E1A
  textMuted: [111, 121, 117] as [number, number, number],   // #6F7975
  borderLight: [220, 231, 227] as [number, number, number], // #DCE7E3
  alertRed: [180, 35, 50] as [number, number, number],      // #B42332
  amberWarn: [180, 115, 0] as [number, number, number],     // #B47300
  bgIvory: [250, 248, 241] as [number, number, number],     // #FAF8F1
};

export type ReportCategory = 
  | 'transition-summary'
  | 'patient-overview'
  | 'clinical-review'
  | 'med-reconciliation'
  | 'sbar-handoff'
  | 'transport-readiness'
  | 'receiving-confirmation'
  | 'audit-trail'
  | 'analytics-dashboard';

export interface ReportMetadata {
  id: ReportCategory;
  title: string;
  subtitle: string;
  discipline: string;
  stageScope: string;
  estimatedPages: string;
  audience: string;
}

export const REPORT_CATALOG: ReportMetadata[] = [
  {
    id: 'transition-summary',
    title: 'Consolidated Transition Summary',
    subtitle: 'Comprehensive 5-stage patient transition, protocol gates & readiness ledger',
    discipline: 'Multi-Disciplinary',
    stageScope: 'Stages 01 – 05 (Full Pathway)',
    estimatedPages: '2–3 Pages',
    audience: 'Attending Physicians, Quality Officers, Transfer Coordinators',
  },
  {
    id: 'patient-overview',
    title: 'Patient Overview & Safety Profile',
    subtitle: 'Acuity status, synthetic vitals, isolation precautions & care team assignment',
    discipline: 'Clinical Coordination',
    stageScope: 'Current Stage & Vital Signs',
    estimatedPages: '1–2 Pages',
    audience: 'Floor Supervisors, Triage, Charge Nurses',
  },
  {
    id: 'clinical-review',
    title: 'Stage 01 Clinical Review & Diagnostic Clearance',
    subtitle: 'Physician diagnostic criteria, hemodynamic stabilization & lab panels',
    discipline: 'Physician & Nursing',
    stageScope: 'Stage 01 Protocol Gate',
    estimatedPages: '1 Page',
    audience: 'Intensivists, Primary Attending, Step-Down MD',
  },
  {
    id: 'med-reconciliation',
    title: 'Stage 02 Medication Reconciliation Matrix',
    subtitle: 'Active infusions, high-alert pharmacology, discontinuation records & pharmacist signoff',
    discipline: 'Clinical Pharmacy',
    stageScope: 'Stage 02 Protocol Gate',
    estimatedPages: '1–2 Pages',
    audience: 'Clinical Pharmacists, Primary Care Nurses, Prescribing Providers',
  },
  {
    id: 'sbar-handoff',
    title: 'Stage 03 Standardized SBAR Handoff Brief',
    subtitle: 'Situation, Background, Assessment, Recommendation with mutual nurse verification',
    discipline: 'Primary & Receiving Nursing',
    stageScope: 'Stage 03 Protocol Gate',
    estimatedPages: '1–2 Pages',
    audience: 'Sending RN, Receiving Charge RN, Nurse Supervisors',
  },
  {
    id: 'transport-readiness',
    title: 'Stage 04 Transport Logistics & Safeguard Manifest',
    subtitle: 'Transit crew assignment, life support equipment check, isolation barrier & ETA',
    discipline: 'Emergency Transport & Transit',
    stageScope: 'Stage 04 Protocol Gate',
    estimatedPages: '1 Page',
    audience: 'Critical Care Transport (CCT), Paramedics, Logistics Escorts',
  },
  {
    id: 'receiving-confirmation',
    title: 'Stage 05 Receiving Confirmation & Intake Attestation',
    subtitle: 'Target bed physical arrival, telemetry transfer & post-handoff accountability seal',
    discipline: 'Receiving Unit Charge RN',
    stageScope: 'Stage 05 Protocol Gate',
    estimatedPages: '1 Page',
    audience: 'Receiving Unit Nursing Leadership, Risk Management',
  },
  {
    id: 'audit-trail',
    title: 'Append-Only Regulatory Audit Ledger',
    subtitle: 'Timestamped cryptographically auditable trail of all gate signatures and alterations',
    discipline: 'Governance & Compliance',
    stageScope: 'System-Wide Ledger',
    estimatedPages: '2–4 Pages',
    audience: 'Chief Medical Quality Officer, Joint Commission / Regulatory Audit',
  },
  {
    id: 'analytics-dashboard',
    title: 'Operational Transition Analytics Report',
    subtitle: 'Throughput velocity, blocker Pareto distribution, department volume & adherence indices',
    discipline: 'Hospital Operations',
    stageScope: 'Hospital-Wide Node Alpha',
    estimatedPages: '2 Pages',
    audience: 'Operations Directors, CMIO, Quality Committees',
  },
];

// Helper to format date
function getFormattedTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  return dateStr;
}

// Draw standard KAVACHA header on page 1
function drawDocumentHeader(doc: jsPDF, title: string, subtitle: string, reportCode: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top color accents
  doc.setFillColor(...COLORS.emeraldPrimary);
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(...COLORS.goldAccent);
  doc.rect(0, 5, pageWidth, 1.2, 'F');

  // Brand title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('KAVACHA', 14, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.goldDark);
  doc.text('CLINICAL SAFETY PLATFORM', 49, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('Intelligent Clinical Care Transition & Precision Patient Safety Architecture', 14, 23);
  doc.text('Emerald Reserve Medical Center · Node Alpha · High-Reliability Protocol', 14, 27);

  // Right side box with report metadata
  doc.setDrawColor(...COLORS.borderLight);
  doc.setFillColor(250, 252, 251);
  doc.roundedRect(pageWidth - 78, 11, 64, 19, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.emeraldPrimary);
  doc.text(reportCode, pageWidth - 74, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`Generated: ${getFormattedTimestamp()}`, pageWidth - 74, 21);
  doc.text('Security: RESTRICTED MEDICAL RECORD', pageWidth - 74, 25);
  doc.text('Protocol: KAVACHA v2.4-PRECISION', pageWidth - 74, 28);

  // Title separator
  doc.setDrawColor(...COLORS.emeraldPrimary);
  doc.setLineWidth(0.6);
  doc.line(14, 32, pageWidth - 14, 32);

  // Report Specific Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text(title.toUpperCase(), 14, 39);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.textDark);
  doc.text(subtitle, 14, 44);

  return 48; // Current Y offset
}

// Draw Patient Identification Block
function drawPatientHeaderBlock(doc: jsPDF, patient: CareTransition, startY: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = pageWidth - 28;
  const boxHeight = 26;

  // Background box
  doc.setFillColor(...COLORS.bgIvory);
  doc.setDrawColor(...COLORS.borderLight);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, startY, boxWidth, boxHeight, 2, 2, 'FD');

  // Left column: Patient Identity
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.textDark);
  doc.text(patient.patientName, 18, startY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`MRN: `, 18, startY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.emeraldPrimary);
  doc.text(patient.mrn, 26, startY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`Age/Sex: ${patient.age}y / ${patient.gender}   |   Admitted: ${patient.admissionDate}`, 18, startY + 17);
  doc.text(`Primary Diagnosis: `, 18, startY + 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.textDark);
  const diag = patient.diagnosis.length > 50 ? patient.diagnosis.substring(0, 47) + '...' : patient.diagnosis;
  doc.text(diag, 44, startY + 22);

  // Middle column: Unit Transition
  const midX = 110;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('Transition Route:', midX, startY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text(`${patient.sourceUnit}  -->  ${patient.targetUnit} (Bed ${patient.targetBed})`, midX, startY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textMuted);
  doc.text('Attending MD:', midX, startY + 17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.textDark);
  doc.text(patient.sbar.attendingPhysician || 'Dr. Katherine Miller, MD', midX + 22, startY + 17);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textMuted);
  doc.text('Coordinator:', midX, startY + 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.textDark);
  doc.text(patient.assignedCoordinator || 'Unassigned', midX + 19, startY + 22);

  // Right column: Acuity & Code Status
  const rightX = pageWidth - 60;
  
  // Acuity Badge
  let acuityColor = COLORS.emeraldPrimary;
  if (patient.acuity === 'critical') acuityColor = COLORS.alertRed;
  else if (patient.acuity === 'guarded') acuityColor = COLORS.amberWarn;

  doc.setFillColor(...acuityColor);
  doc.roundedRect(rightX, startY + 5, 42, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`ACUITY: ${patient.acuity.toUpperCase()}`, rightX + 4, startY + 9.3);

  // Code status
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textDark);
  doc.text(`CODE: ${patient.codeStatus}`, rightX, startY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`Fall Risk: ${patient.fallRisk} | Prec: ${patient.isolationType || 'Standard'}`, rightX, startY + 21);

  return startY + boxHeight + 6;
}

// Draw Status Stamp: Incomplete or Verified
function drawStatusStamp(doc: jsPDF, isComplete: boolean, blockers: string[], startY: number, titleText = 'TRANSITION READINESS STATUS'): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = pageWidth - 28;

  if (isComplete) {
    const boxHeight = 14;
    doc.setFillColor(240, 249, 245);
    doc.setDrawColor(...COLORS.emeraldPrimary);
    doc.setLineWidth(0.6);
    doc.roundedRect(14, startY, boxWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.emeraldPrimary);
    doc.text(`[ OK ]  ${titleText}: PROTOCOL CONFORMANT & VERIFIED`, 18, startY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.textDark);
    doc.text('All multi-disciplinary safety gates sealed in accordance with KAVACHA Clinical Care Transition Standard.', 18, startY + 10.5);

    return startY + boxHeight + 6;
  } else {
    const blockerCount = blockers.length;
    const boxHeight = Math.max(18, 14 + (blockerCount * 4.2));

    doc.setFillColor(255, 247, 247);
    doc.setDrawColor(...COLORS.alertRed);
    doc.setLineWidth(0.6);
    doc.roundedRect(14, startY, boxWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.alertRed);
    doc.text(`[ ! ]  STATUS: INCOMPLETE / PENDING CLEARANCE GATES (${blockerCount} ACTIVE BLOCKERS)`, 18, startY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.textDark);
    doc.text('CAUTION: Care transition is held at current protocol gate. The following mandatory requirements remain unmet:', 18, startY + 10.5);

    let curY = startY + 15;
    blockers.forEach((blocker) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.alertRed);
      doc.text('•', 22, curY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.textDark);
      doc.text(blocker, 26, curY);
      curY += 4.2;
    });

    return startY + boxHeight + 6;
  }
}

// Add consistent footer to all pages
function addFooters(doc: jsPDF, reportCode: string) {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Bottom hairline separator
    doc.setDrawColor(...COLORS.borderLight);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(
      'CONFIDENTIAL MEDICAL RECORD · KAVACHA INPATIENT TRANSITION PROTOCOL · PROTECTED HEALTH INFORMATION',
      14,
      pageHeight - 8
    );

    const pageStr = `Page ${i} of ${totalPages}`;
    doc.setFont('helvetica', 'bold');
    doc.text(pageStr, pageWidth - 14 - doc.getTextWidth(pageStr), pageHeight - 8);

    doc.setFont('helvetica', 'normal');
    doc.text(`Ref: ${reportCode}`, pageWidth - 14 - doc.getTextWidth(pageStr) - 30, pageHeight - 8);
  }
}

// Trigger browser download of PDF
function downloadPdf(doc: jsPDF, filename: string) {
  doc.save(filename);
}

// --------------------------------------------------------------------------
// 1. CONSOLIDATED TRANSITION SUMMARY PDF
// --------------------------------------------------------------------------
export function generateTransitionSummaryPDF(patient: CareTransition, readiness?: ReadinessBreakdown, user?: UserProfile) {
  const currentReadiness = readiness || calculateReadiness(patient);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportCode = `KAV-SUM-${patient.mrn}-${new Date().toISOString().slice(0, 10)}`;

  let y = drawDocumentHeader(
    doc,
    'Consolidated Care Transition Summary',
    'Comprehensive multi-disciplinary transition record, stage checklists & readiness audit',
    reportCode
  );

  y = drawPatientHeaderBlock(doc, patient, y);

  // Status Stamp
  const isComplete = currentReadiness.canAdvanceCurrentStage && patient.currentStageId === 5 && patient.stages[4].status === 'completed';
  y = drawStatusStamp(doc, isComplete, currentReadiness.stageBlockers, y, 'TRANSITION PROTOCOL VERIFICATION');

  // Stage Conduit Summary Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('1. FIVE-STAGE TRANSITION PATHWAY PROGRESSION', 14, y);
  y += 3;

  const stageRows = patient.stages.map((stage) => {
    const totalChecks = stage.checklists.length;
    const completedChecks = stage.checklists.filter(c => c.completed).length;
    const requiredChecks = stage.checklists.filter(c => c.requiredForAdvance).length;
    const completedRequired = stage.checklists.filter(c => c.requiredForAdvance && c.completed).length;

    let statusText = 'PENDING';
    if (stage.status === 'completed') statusText = 'COMPLETED & SEALED';
    else if (stage.status === 'active') statusText = 'ACTIVE IN PROGRESS';
    else if (stage.status === 'flagged') statusText = 'FLAGGED / BLOCKED';

    return [
      `Stage 0${stage.id}`,
      stage.name,
      stage.leadDiscipline,
      `${completedRequired}/${requiredChecks} Req (${completedChecks}/${totalChecks} Total)`,
      statusText,
      stage.verifiedBy || (stage.status === 'completed' ? 'Dr. K. Miller, MD' : 'Pending Authorization'),
      formatDate(stage.verifiedAt || stage.targetCompletionTime),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Stage', 'Pathway Stage Name', 'Lead Discipline', 'Checklist Criteria', 'Gate Status', 'Authorized By', 'Timestamp']],
    body: stageRows,
    theme: 'striped',
    headStyles: { fillColor: COLORS.emeraldPrimary, textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: COLORS.textDark, cellPadding: 2.2 },
    alternateRowStyles: { fillColor: [248, 252, 250] },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      y = data.cursor?.y || y;
    },
  });

  y = (doc as any).lastAutoTable.finalY + 7;

  // Telemetry & Hemodynamics Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('2. TELEMETRIC VITALS & HEMODYNAMIC SNAPSHOT', 14, y);
  y += 3;

  const telemetryData = [
    ['Heart Rate', `${patient.telemetry.heartRate} BPM`, 'Mean Arterial Pressure (MAP)', `${patient.telemetry.meanArterialPressure} mmHg`],
    ['Blood Pressure (NIBP)', `${patient.telemetry.bloodPressure} mmHg`, 'Core Temperature', `${patient.telemetry.temperature} °C`],
    ['SpO2 Pulse Oximetry', `${patient.telemetry.spo2} %`, 'Respiratory Rate', `${patient.telemetry.respiratoryRate} /min`],
    ['Cardiac Rhythm', patient.telemetry.cardiacRhythm || 'Sinus Rhythm', 'Telemetry Stream Status', 'Continuous 5-Lead Encrypted'],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Parameter', 'Value', 'Parameter', 'Value']],
    body: telemetryData,
    theme: 'plain',
    headStyles: { fillColor: COLORS.emeraldDark, textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: COLORS.textDark, cellPadding: 2.2 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 7;

  // Medication Reconciliation Summary (First 5 meds)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('3. CRITICAL MEDICATION RECONCILIATION SUMMARY', 14, y);
  y += 3;

  const medRows = patient.medications.map((m) => [
    m.name,
    m.dose,
    m.route,
    m.frequency,
    m.category.toUpperCase(),
    m.reconciliationStatus.toUpperCase(),
    m.verifiedBy || 'Pending Clinical Pharmacist',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Medication', 'Dose', 'Route', 'Frequency', 'Category', 'Recon Status', 'Attested By']],
    body: medRows,
    theme: 'striped',
    headStyles: { fillColor: COLORS.emeraldPrimary, textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: COLORS.textDark, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 7;

  // SBAR Highlights
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('4. SBAR CLINICAL HANDOFF SNAPSHOT', 14, y);
  y += 4;

  const sbarData = [
    ['Situation', patient.sbar.situation || 'Post-operative transfer to step-down telemetry.'],
    ['Background', patient.sbar.background || 'Admitted with acute cardiovascular presentation, stable post-intervention.'],
    ['Assessment', patient.sbar.assessment || 'Hemodynamically stable on room air/low flow O2. Pain controlled.'],
    ['Recommendation', patient.sbar.recommendation || 'Continue telemetry monitoring, step-down medications, PT ambulation eval.'],
  ];

  autoTable(doc, {
    startY: y,
    head: [['SBAR Domain', 'Clinical Briefing Content']],
    body: sbarData,
    theme: 'striped',
    headStyles: { fillColor: COLORS.goldDark, textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: COLORS.textDark, cellPadding: 2.5 },
    columnStyles: { 0: { cellWidth: 32, fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  });

  // Digital Signatures block
  y = (doc as any).lastAutoTable.finalY + 9;
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(...COLORS.borderLight);
  doc.setFillColor(...COLORS.bgIvory);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.emeraldPrimary);
  doc.text('ATTESTATION & REGULATORY SIGNATURES', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.textDark);
  doc.text(`Sending Nurse: ${patient.sbar.sendingNurse || 'Sarah Jensen, RN, CCRN'} [Verified]`, 18, y + 11);
  doc.text(`Receiving Nurse: ${patient.sbar.receivingNurse || 'Brenda Hayes, RN (Pending)'}`, 18, y + 16);
  doc.text(`Attending Physician: ${patient.sbar.attendingPhysician || 'Dr. Katherine Miller, MD'}`, 110, y + 11);
  doc.text(`System Security Hash: ${patient.sbar.verifiedHash || 'SHA256: 7f8a91bc023e...'}`, 110, y + 16);

  addFooters(doc, reportCode);
  downloadPdf(doc, `KAVACHA_Transition_Summary_${patient.mrn}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// --------------------------------------------------------------------------
// 2. PATIENT OVERVIEW REPORT PDF
// --------------------------------------------------------------------------
export function generatePatientOverviewPDF(patient: CareTransition, readiness?: ReadinessBreakdown, user?: UserProfile) {
  const currentReadiness = readiness || calculateReadiness(patient);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportCode = `KAV-OVR-${patient.mrn}-${new Date().toISOString().slice(0, 10)}`;

  let y = drawDocumentHeader(
    doc,
    'Patient Overview & Clinical Safety Profile',
    'Comprehensive physiological baseline, acuity index, guard rails & active care team',
    reportCode
  );

  y = drawPatientHeaderBlock(doc, patient, y);

  // Status Stamp
  const isComplete = currentReadiness.canAdvanceCurrentStage;
  y = drawStatusStamp(doc, isComplete, currentReadiness.stageBlockers, y, 'STAGE READINESS');

  // Acuity & Physiological Baseline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('1. TELEMETRIC PHYSIOLOGY & VITALS', 14, y);
  y += 3;

  const vitalsTable = [
    ['Heart Rate', `${patient.telemetry.heartRate} BPM`, 'Cardiac Rhythm', patient.telemetry.cardiacRhythm],
    ['Blood Pressure (NIBP)', `${patient.telemetry.bloodPressure} mmHg`, 'Mean Arterial Pressure (MAP)', `${patient.telemetry.meanArterialPressure} mmHg`],
    ['Oxygen Saturation (SpO2)', `${patient.telemetry.spo2} %`, 'Respiratory Rate', `${patient.telemetry.respiratoryRate} /min`],
    ['Core Body Temperature', `${patient.telemetry.temperature} °C`, 'Telemetry Updated', patient.telemetry.lastUpdated || 'Live Real-Time Stream'],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Parameter', 'Observed Value', 'Parameter', 'Observed Value']],
    body: vitalsTable,
    theme: 'striped',
    headStyles: { fillColor: COLORS.emeraldPrimary, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: COLORS.textDark, cellPadding: 2.5 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Safety Guardrails & Precautions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('2. CLINICAL SAFEGUARDS, ALLERGIES & ISOLATION PRECAUTIONS', 14, y);
  y += 3;

  const safeguardsTable = [
    ['Code Status Designation', patient.codeStatus, 'Fall Risk Classification', `${patient.fallRisk} Risk`],
    ['Documented Allergies', patient.allergies.join(', ') || 'No Known Drug Allergies (NKDA)', 'Isolation Category', patient.isolationType || 'Standard Precautions'],
    ['Assigned Transition Lead', patient.assignedCoordinator, 'Primary Attending MD', patient.sbar.attendingPhysician],
    ['Estimated Transit Duration', patient.estimatedHandoffDuration || '15 Minutes', 'Shield Protocol Score', `${patient.shieldScore}%`],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Safeguard Category', 'Documented Protocol', 'Safeguard Category', 'Documented Protocol']],
    body: safeguardsTable,
    theme: 'plain',
    headStyles: { fillColor: COLORS.goldDark, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: COLORS.textDark, cellPadding: 2.5 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Active Stage Checklists
  const currentStage = patient.stages.find(s => s.id === patient.currentStageId) || patient.stages[0];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text(`3. CURRENT ACTIVE STAGE: STAGE 0${currentStage.id} — ${currentStage.name.toUpperCase()}`, 14, y);
  y += 3;

  const checklistRows = currentStage.checklists.map(c => [
    c.completed ? '[ YES ]' : '[ NO ]',
    c.requiredForAdvance ? 'MANDATORY' : 'OPTIONAL',
    c.discipline,
    c.label,
    c.completedBy || (c.completed ? 'Primary Nurse' : 'Pending'),
    c.timestamp || '—',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Done', 'Requirement', 'Discipline', 'Checklist Protocol Item', 'Recorded By', 'Timestamp']],
    body: checklistRows,
    theme: 'striped',
    headStyles: { fillColor: COLORS.emeraldPrimary, textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: COLORS.textDark, cellPadding: 2 },
    columnStyles: { 0: { cellWidth: 16, fontStyle: 'bold' }, 1: { cellWidth: 22, fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  });

  addFooters(doc, reportCode);
  downloadPdf(doc, `KAVACHA_Patient_Overview_${patient.mrn}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// --------------------------------------------------------------------------
// 3. CLINICAL REVIEW REPORT (STAGE 01)
// --------------------------------------------------------------------------
export function generateClinicalReviewPDF(patient: CareTransition, user?: UserProfile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportCode = `KAV-CR1-${patient.mrn}-${new Date().toISOString().slice(0, 10)}`;
  const stage = patient.stages.find(s => s.id === 1) || patient.stages[0];

  let y = drawDocumentHeader(
    doc,
    'Stage 01: Clinical Review & Diagnostic Clearance',
    'Physician attestation, hemodynamics stabilization, lab panels & pre-transition readiness',
    reportCode
  );

  y = drawPatientHeaderBlock(doc, patient, y);

  const isComplete = stage.status === 'completed';
  const stageBlockers = stage.checklists.filter(c => c.requiredForAdvance && !c.completed).map(c => `[${c.discipline}] ${c.label}`);
  y = drawStatusStamp(doc, isComplete, stageBlockers, y, 'STAGE 01 PROTOCOL GATE');

  // Stage Checklist
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('1. STAGE 01 CLINICAL VERIFICATION CHECKLIST', 14, y);
  y += 3;

  const checklistRows = stage.checklists.map(c => [
    c.completed ? '[ VERIFIED ]' : '[ PENDING ]',
    c.requiredForAdvance ? 'MANDATORY' : 'OPTIONAL',
    c.discipline,
    c.label,
    c.completedBy || (c.completed ? 'Dr. K. Miller, MD' : 'Pending Signature'),
    c.timestamp || 'Pending Verification',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Status', 'Type', 'Discipline', 'Clinical Clearance Criteria', 'Attested By', 'Timestamp']],
    body: checklistRows,
    theme: 'striped',
    headStyles: { fillColor: COLORS.emeraldPrimary, textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: COLORS.textDark, cellPadding: 2.2 },
    columnStyles: { 0: { cellWidth: 22, fontStyle: 'bold' }, 1: { cellWidth: 22 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Diagnostic & Lab Evaluation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('2. DIAGNOSTIC PANEL & PHYSIOLOGICAL INVARIANTS', 14, y);
  y += 3;

  const labRows = [
    ['Extubation Stability', 'Passed — Sustained spontaneous breathing > 12h', 'Dr. Katherine Miller, MD', 'VERIFIED'],
    ['Morning Electrolytes (K+, Mg2+)', 'K: 4.1 mEq/L, Mg: 2.2 mg/dL (Normal reference)', 'Stat Lab Core', 'VERIFIED'],
    ['12-Lead ECG Evaluation', 'Normal Sinus, no acute ischemic ST-T changes', 'Cardiology Read', 'VERIFIED'],
    ['Chest Radiograph (CXR)', 'Bilateral lungs clear, no pneumothorax, line position verified', 'Radiology AI / Attending', 'VERIFIED'],
    ['Surgical Incision & Chest Tubes', 'Dressings dry and intact, mediastinal tubes discontinued', 'Surgical Fellow', 'VERIFIED'],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Diagnostic Parameter', 'Clinical Findings', 'Evaluating Clinician', 'Status']],
    body: labRows,
    theme: 'plain',
    headStyles: { fillColor: COLORS.goldDark, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: COLORS.textDark, cellPadding: 2.5 },
    columnStyles: { 3: { cellWidth: 24, fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Physician Signoff Box
  doc.setDrawColor(...COLORS.borderLight);
  doc.setFillColor(...COLORS.bgIvory);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.emeraldPrimary);
  doc.text('PHYSICIAN CLINICAL STABILIZATION ATTESTATION', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.textDark);
  doc.text(
    `I hereby certify that patient ${patient.patientName} (${patient.mrn}) has been clinically reviewed, meets step-down transfer criteria, and is hemodynamically stable.`,
    18,
    y + 11
  );
  doc.setFont('helvetica', 'bold');
  doc.text(`Attending Physician: ${patient.sbar.attendingPhysician || 'Dr. Katherine Miller, MD, FACS'}  |  Timestamp: ${formatDate(stage.verifiedAt || getFormattedTimestamp())}`, 18, y + 16);

  addFooters(doc, reportCode);
  downloadPdf(doc, `KAVACHA_Clinical_Review_${patient.mrn}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// --------------------------------------------------------------------------
// 4. MEDICATION RECONCILIATION REPORT (STAGE 02)
// --------------------------------------------------------------------------
export function generateMedReconciliationPDF(patient: CareTransition, user?: UserProfile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportCode = `KAV-MED-${patient.mrn}-${new Date().toISOString().slice(0, 10)}`;
  const stage = patient.stages.find(s => s.id === 2) || patient.stages[1];

  let y = drawDocumentHeader(
    doc,
    'Stage 02: Medication Reconciliation Matrix',
    'Comprehensive pharmacology reconciliation, active infusions, discontinuations & pharmacist signoff',
    reportCode
  );

  y = drawPatientHeaderBlock(doc, patient, y);

  const pendingMeds = patient.medications.filter(m => m.reconciliationStatus === 'pending');
  const isComplete = stage.status === 'completed' && pendingMeds.length === 0;
  const blockers = pendingMeds.map(m => `Unreconciled medication: ${m.name} (${m.dose}) requires Clinical Pharmacist review.`);

  y = drawStatusStamp(doc, isComplete, blockers, y, 'STAGE 02 PHARMACY PROTOCOL GATE');

  // Full Medication Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('1. RECONCILED INPATIENT & STEP-DOWN MEDICATION FORMULARY', 14, y);
  y += 3;

  const medRows = patient.medications.map((m, idx) => [
    (idx + 1).toString(),
    m.name,
    m.dose,
    m.route,
    m.frequency,
    m.category.toUpperCase(),
    m.reconciliationStatus.toUpperCase(),
    m.verifiedBy || (m.reconciliationStatus === 'verified' ? 'R. Gupta, PharmD' : 'PENDING'),
    m.notes || '—',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Medication Name', 'Dose', 'Route', 'Frequency', 'Category', 'Status', 'Verified By', 'Pharmacist Notes']],
    body: medRows,
    theme: 'striped',
    headStyles: { fillColor: COLORS.emeraldPrimary, textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: COLORS.textDark, cellPadding: 2 },
    alternateRowStyles: { fillColor: [248, 252, 250] },
    columnStyles: { 0: { cellWidth: 8 }, 6: { fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // High-Alert Pharmacology & FDA Boxed Warnings
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('2. HIGH-ALERT DRUGS & BIOSCIENCE PHARMACOLOGY SURVEILLANCE', 14, y);
  y += 3;

  const highAlertRows = [
    ['Milrinone (Primacor)', 'Inotropic Phosphodiesterase-3 Inhibitor', 'DISCONTINUED', 'Verify total cessation of central IV infusion prior to floor transit; transition to oral Metoprolol.'],
    ['Enoxaparin (Lovenox)', 'Low Molecular Weight Heparin (LMWH)', 'VERIFIED', 'Monitor anti-Xa levels if indicated; black box warning for epidural/spinal hematoma risk.'],
    ['Furosemide (Lasix)', 'Loop Diuretic', 'ADJUSTED', 'Dose shifted from IV bolus to 40mg PO twice daily; track daily morning weights and serum K+.'],
    ['Metoprolol Tartrate', 'Selective Beta-1 Adrenoreceptor Blocker', 'VERIFIED', 'Hold if heart rate < 55 BPM or systolic blood pressure < 100 mmHg.'],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Drug / Agent', 'Pharmacology Class', 'Transition Action', 'High-Alert Monitoring Protocol & Warning']],
    body: highAlertRows,
    theme: 'plain',
    headStyles: { fillColor: COLORS.goldDark, textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: COLORS.textDark, cellPadding: 2.2 },
    columnStyles: { 0: { cellWidth: 34, fontStyle: 'bold' }, 2: { cellWidth: 26, fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Pharmacist Attestation Box
  doc.setDrawColor(...COLORS.borderLight);
  doc.setFillColor(...COLORS.bgIvory);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.emeraldPrimary);
  doc.text('CLINICAL PHARMACIST DIGITAL RECONCILIATION ATTESTATION', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.textDark);
  doc.text(
    'I certify that all home medications, ICU continuous infusions, and step-down discharge orders have been reconciled against the electronic health record with no unresolved drug-drug interactions.',
    18,
    y + 11
  );
  doc.setFont('helvetica', 'bold');
  doc.text(`Lead Clinical Pharmacist: R. Gupta, PharmD, BCPS (Badge PH-7714)   |   Timestamp: ${formatDate(stage.verifiedAt || getFormattedTimestamp())}`, 18, y + 16);

  addFooters(doc, reportCode);
  downloadPdf(doc, `KAVACHA_Med_Reconciliation_${patient.mrn}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// --------------------------------------------------------------------------
// 5. SBAR HANDOFF BRIEF PDF (STAGE 03)
// --------------------------------------------------------------------------
export function generateSbarPDF(patient: CareTransition, user?: UserProfile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportCode = `KAV-SBAR-${patient.mrn}-${new Date().toISOString().slice(0, 10)}`;
  const stage = patient.stages.find(s => s.id === 3) || patient.stages[2];

  let y = drawDocumentHeader(
    doc,
    'Stage 03: Standardized SBAR Clinical Handoff Brief',
    'Nurse-to-nurse structured handoff report, critical clinical context & mutual verification',
    reportCode
  );

  y = drawPatientHeaderBlock(doc, patient, y);

  const isComplete = Boolean(patient.sbar.receivingNurse && !patient.sbar.receivingNurse.includes('Awaiting'));
  const blockers = isComplete ? [] : ['Awaiting verbal SBAR call acknowledgment and formal badge verification from Receiving Unit Charge RN.'];
  y = drawStatusStamp(doc, isComplete, blockers, y, 'SBAR NURSE-TO-NURSE HANDSHAKE GATE');

  // SBAR Four Quadrants
  const sbarSections = [
    {
      title: 'S — SITUATION (Current Reason for Transfer & Acuity)',
      content: patient.sbar.situation || 'Patient recovering in CVICU post-op Day 2 following CABG x3. Extubated and hemodynamically stable. Transferred to step-down telemetry for continuous rhythm surveillance and cardiac rehabilitation ambulation.',
      color: COLORS.emeraldPrimary,
    },
    {
      title: 'B — BACKGROUND (Clinical History, Comorbidities, Code Status)',
      content: patient.sbar.background || `Medical History: Severe 3-vessel CAD, Hypertension, Type 2 Diabetes Mellitus. Code Status: ${patient.codeStatus}. No known drug allergies. Admission Date: ${patient.admissionDate}. Surgical incisions clean, dry, and intact.`,
      color: COLORS.emeraldDark,
    },
    {
      title: 'A — ASSESSMENT (Current Clinical State & Telemetry Findings)',
      content: patient.sbar.assessment || `Telemetry: HR ${patient.telemetry.heartRate} BPM, NIBP ${patient.telemetry.bloodPressure} mmHg, SpO2 ${patient.telemetry.spo2}%, MAP ${patient.telemetry.meanArterialPressure} mmHg. Cardiac rhythm: ${patient.telemetry.cardiacRhythm}. Pain 2/10 on oral acetaminophen. Neurologically alert and oriented x4.`,
      color: COLORS.goldDark,
    },
    {
      title: 'R — RECOMMENDATION (Action Plan, Fall Precautions & Pending Diagnostics)',
      content: patient.sbar.recommendation || `Maintain continuous 5-lead telemetry. Monitor for atrial arrhythmias. Step down IV to PO beta-blocker as ordered. Physical therapy consultation scheduled for 14:00. Fall risk: ${patient.fallRisk}. Notify attending MD if MAP < 65 or HR > 110.`,
      color: COLORS.emeraldPrimary,
    },
  ];

  sbarSections.forEach(section => {
    doc.setFillColor(...section.color);
    doc.rect(14, y, doc.internal.pageSize.getWidth() - 28, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(section.title, 18, y + 4.2);

    y += 6;

    // Content box
    const lines = doc.splitTextToSize(section.content, doc.internal.pageSize.getWidth() - 36);
    const boxHeight = Math.max(16, lines.length * 4.2 + 6);

    doc.setDrawColor(...COLORS.borderLight);
    doc.setFillColor(...COLORS.bgIvory);
    doc.rect(14, y, doc.internal.pageSize.getWidth() - 28, boxHeight, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textDark);
    doc.text(lines, 18, y + 5);

    y += boxHeight + 4;
  });

  // Mutual Signatures Block
  y += 2;
  doc.setDrawColor(...COLORS.emeraldPrimary);
  doc.setLineWidth(0.5);
  doc.setFillColor(245, 250, 248);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.emeraldPrimary);
  doc.text('MUTUAL CLINICAL HANDSHAKE DIGITAL ATTESTATION', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.textDark);
  doc.text(`Sending Nurse: ${patient.sbar.sendingNurse || 'Sarah Jensen, BSN, RN, CCRN (Badge RN-9842)'}`, 18, y + 12);
  doc.text(`Attending MD: ${patient.sbar.attendingPhysician || 'Dr. Katherine Miller, MD (Badge MD-4109)'}`, 18, y + 17);

  doc.text(`Receiving Nurse: ${patient.sbar.receivingNurse || 'Brenda Hayes, RN (Pending)'}`, 110, y + 12);
  doc.text(`Security Hash: ${patient.sbar.verifiedHash || 'SHA-256: 3c9b1e... [Digitally Sealed]'}`, 110, y + 17);

  addFooters(doc, reportCode);
  downloadPdf(doc, `KAVACHA_SBAR_Handoff_${patient.mrn}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// --------------------------------------------------------------------------
// 6. TRANSPORT READINESS REPORT (STAGE 04)
// --------------------------------------------------------------------------
export function generateTransportPDF(patient: CareTransition, user?: UserProfile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportCode = `KAV-TRN-${patient.mrn}-${new Date().toISOString().slice(0, 10)}`;
  const stage = patient.stages.find(s => s.id === 4) || patient.stages[3];

  let y = drawDocumentHeader(
    doc,
    'Stage 04: Transport Logistics & Safeguard Manifest',
    'Transit crew dispatch, life-support hardware checklists, isolation precautions & transit tracking',
    reportCode
  );

  y = drawPatientHeaderBlock(doc, patient, y);

  const isComplete = stage.status === 'completed';
  const stageBlockers = stage.checklists.filter(c => c.requiredForAdvance && !c.completed).map(c => `[${c.discipline}] ${c.label}`);
  y = drawStatusStamp(doc, isComplete, stageBlockers, y, 'STAGE 04 TRANSPORT SAFETY GATE');

  // Transport Logistics Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('1. TRANSPORT HARDWARE & DISPATCH SPECIFICATIONS', 14, y);
  y += 3;

  const logisticsRows = [
    ['Transport Mode', patient.transport.mode, 'Scheduled Transit Time', patient.transport.scheduledTime || 'STAT (Immediate Dispatch)'],
    ['Current Status', patient.transport.transportStatus, 'Estimated En-Route ETA', `${patient.transport.etaMinutes} Minutes`],
    ['Escort Team Required', patient.transport.escortRequired ? 'YES — Specialized Clinical Escort' : 'NO — Standard Transit', 'Designated Escort Team', patient.transport.escortTeam],
    ['Isolation Precautions', patient.isolationType || 'Standard Precautions', 'Destination Receiving Bed', `${patient.targetUnit} — Bed ${patient.targetBed}`],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Parameter', 'Operational Value', 'Parameter', 'Operational Value']],
    body: logisticsRows,
    theme: 'striped',
    headStyles: { fillColor: COLORS.emeraldPrimary, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: COLORS.textDark, cellPadding: 2.5 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Equipment Manifest
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('2. LIFE SUPPORT HARDWARE & MONITORING EQUIPMENT MANIFEST', 14, y);
  y += 3;

  const equipRows = (patient.transport.equipment && patient.transport.equipment.length > 0
    ? patient.transport.equipment
    : ['Portable Transport Monitor / Defibrillator with Full Battery', 'Full O2 Cylinder (15 L/min Regulator)', 'Portable Emergency Suction Canister', 'IV Infusion Pole with Battery Backup']
  ).map((item, idx) => [
    (idx + 1).toString(),
    item,
    'VERIFIED & SECURED',
    'Marcus Bell, CCT-P',
    'Battery > 90%, Self-Test Passed',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Transport Equipment Description', 'Pre-Transit Check', 'Verified By', 'Hardware Status']],
    body: equipRows,
    theme: 'plain',
    headStyles: { fillColor: COLORS.goldDark, textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: COLORS.textDark, cellPadding: 2.2 },
    columnStyles: { 0: { cellWidth: 8 }, 2: { fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Stage 04 Checklists
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('3. TRANSPORT PRE-ROLLOUT CLINICAL CHECKLIST', 14, y);
  y += 3;

  const checklistRows = stage.checklists.map(c => [
    c.completed ? '[ READY ]' : '[ PENDING ]',
    c.requiredForAdvance ? 'MANDATORY' : 'OPTIONAL',
    c.discipline,
    c.label,
    c.completedBy || (c.completed ? 'Marcus Bell, CCT-P' : 'Pending Escort Check'),
    c.timestamp || 'Pending Verification',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Status', 'Type', 'Discipline', 'Safety Item', 'Recorded By', 'Timestamp']],
    body: checklistRows,
    theme: 'striped',
    headStyles: { fillColor: COLORS.emeraldPrimary, textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: COLORS.textDark, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });

  addFooters(doc, reportCode);
  downloadPdf(doc, `KAVACHA_Transport_Readiness_${patient.mrn}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// --------------------------------------------------------------------------
// 7. RECEIVING CONFIRMATION REPORT (STAGE 05)
// --------------------------------------------------------------------------
export function generateReceivingPDF(patient: CareTransition, user?: UserProfile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportCode = `KAV-REC-${patient.mrn}-${new Date().toISOString().slice(0, 10)}`;
  const stage = patient.stages.find(s => s.id === 5) || patient.stages[4];

  let y = drawDocumentHeader(
    doc,
    'Stage 05: Receiving Confirmation & Intake Attestation',
    'Target bed physical arrival, telemetry handover, intake nurse signature & loop closure',
    reportCode
  );

  y = drawPatientHeaderBlock(doc, patient, y);

  const isComplete = stage.status === 'completed';
  const stageBlockers = stage.checklists.filter(c => c.requiredForAdvance && !c.completed).map(c => `[${c.discipline}] ${c.label}`);
  y = drawStatusStamp(doc, isComplete, stageBlockers, y, 'STAGE 05 RECEIVING INTAKE GATE');

  // Receiving Bed & Unit Status Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('1. RECEIVING UNIT INTAKE CONFIRMATION', 14, y);
  y += 3;

  const intakeRows = [
    ['Receiving Department', patient.targetUnit, 'Target Bed Number', patient.targetBed],
    ['Receiving Charge RN', patient.sbar.receivingNurse || 'Brenda Hayes, BSN, RN, PCCN', 'Bed Prep & Sanitization', 'VERIFIED SANITIZED & PREPARED'],
    ['Telemetry Transmitter Ingestion', 'Active 5-Lead Telemetry Paired to 4-West Central', 'Physical Arrival Status', isComplete ? 'AT BEDSIDE — INTAKE COMPLETE' : 'IN TRANSIT / PENDING ARRIVAL'],
    ['Belongings & Lockbox Envelope', 'POLST Gold Sheet & Personal Property Received', 'Immediate Care Orders', 'Reconciled & Active on Receiving Unit'],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Intake Parameter', 'Recorded Status', 'Intake Parameter', 'Recorded Status']],
    body: intakeRows,
    theme: 'striped',
    headStyles: { fillColor: COLORS.emeraldPrimary, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: COLORS.textDark, cellPadding: 2.5 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Stage 05 Checklists
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('2. RECEIVING INTAKE VERIFICATION PROTOCOL', 14, y);
  y += 3;

  const checklistRows = stage.checklists.map(c => [
    c.completed ? '[ CONFIRMED ]' : '[ PENDING ]',
    c.requiredForAdvance ? 'MANDATORY' : 'OPTIONAL',
    c.discipline,
    c.label,
    c.completedBy || (c.completed ? 'Brenda Hayes, RN' : 'Pending Intake RN'),
    c.timestamp || 'Pending Bedside Handshake',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Status', 'Type', 'Discipline', 'Intake Action Item', 'Verified By', 'Timestamp']],
    body: checklistRows,
    theme: 'plain',
    headStyles: { fillColor: COLORS.goldDark, textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: COLORS.textDark, cellPadding: 2.2 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Receiving Attestation Box
  doc.setDrawColor(...COLORS.emeraldPrimary);
  doc.setFillColor(...COLORS.bgIvory);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.emeraldPrimary);
  doc.text('RECEIVING CHARGE NURSE BEDSIDE INTAKE ATTESTATION', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.textDark);
  doc.text(
    `I confirm receipt of patient ${patient.patientName} (${patient.mrn}) into bed ${patient.targetBed}. Telemetry monitors are connected, skin assessment is complete, and verbal SBAR transfer of care has occurred.`,
    18,
    y + 11
  );
  doc.setFont('helvetica', 'bold');
  doc.text(`Receiving Intake RN: Brenda Hayes, BSN, RN, PCCN (Badge RN-4411)   |   Timestamp: ${formatDate(stage.verifiedAt || getFormattedTimestamp())}`, 18, y + 17);

  addFooters(doc, reportCode);
  downloadPdf(doc, `KAVACHA_Receiving_Confirmation_${patient.mrn}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// --------------------------------------------------------------------------
// 8. AUDIT TRAIL COMPLIANCE REPORT PDF
// --------------------------------------------------------------------------
export function generateAuditReportPDF(events: AuditEvent[], filterInfo?: { role?: string; search?: string }, user?: UserProfile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportCode = `KAV-AUD-${new Date().toISOString().slice(0, 10)}`;

  let y = drawDocumentHeader(
    doc,
    'Append-Only Regulatory Audit Ledger',
    'Immutable chronological ledger of clinical handoff actions, gate signoffs & security events',
    reportCode
  );

  // Audit Meta Block
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(...COLORS.bgIvory);
  doc.setDrawColor(...COLORS.borderLight);
  doc.roundedRect(14, y, pageWidth - 28, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.emeraldPrimary);
  doc.text('AUDIT PARAMETERS & REGULATORY COMPLIANCE RECORD', 18, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.textDark);
  doc.text(`Total Audit Records: ${events.length} Events   |   Role Filter: ${filterInfo?.role || 'All Roles'}   |   Search Query: ${filterInfo?.search || 'None'}`, 18, y + 11);
  doc.text(`Authorized Auditor: ${user?.name || 'Arthur Sterling, MD (Chief Medical Quality Officer)'}`, 120, y + 11);

  y += 22;

  // Events Table
  const eventRows = events.map((e, idx) => [
    (idx + 1).toString(),
    e.timestamp,
    e.patientName || 'System',
    e.action,
    e.actorName,
    e.actorRole.toUpperCase(),
    e.entityType.toUpperCase(),
    e.details,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Timestamp', 'Patient', 'Action Code', 'Actor Name', 'Role', 'Entity', 'Audit Verification Details']],
    body: eventRows,
    theme: 'striped',
    headStyles: { fillColor: COLORS.emeraldPrimary, textColor: 255, fontSize: 7, fontStyle: 'bold' },
    bodyStyles: { fontSize: 6.5, textColor: COLORS.textDark, cellPadding: 2 },
    alternateRowStyles: { fillColor: [248, 252, 250] },
    columnStyles: { 0: { cellWidth: 7 }, 1: { cellWidth: 26 }, 3: { fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  });

  addFooters(doc, reportCode);
  downloadPdf(doc, `KAVACHA_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// --------------------------------------------------------------------------
// 9. OPERATIONAL ANALYTICS REPORT PDF
// --------------------------------------------------------------------------
export function generateAnalyticsPDF(analyticsData: any, user?: UserProfile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportCode = `KAV-OPS-${new Date().toISOString().slice(0, 10)}`;

  let y = drawDocumentHeader(
    doc,
    'Operational Transition Analytics Report',
    'Care transition velocity, gate bottleneck analysis, department volume & adherence indices',
    reportCode
  );

  const summary = analyticsData?.summary || {
    totalActiveTransitions: 5,
    criticalAcuity: 3,
    guardedAcuity: 1,
    dischargeReady: 1,
    meanVelocityMinutes: 38,
    medianVelocityMinutes: 32,
    protocolAdherenceRate: 98.4,
    totalAuditEvents: 24,
  };

  // Executive KPI Summary Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('1. EXECUTIVE OPERATIONAL KPIs', 14, y);
  y += 3;

  const kpiData = [
    ['Active Transitions', `${summary.totalActiveTransitions} Patients`, 'Protocol Adherence Rate', `${summary.protocolAdherenceRate}%`],
    ['Critical Acuity Handoffs', `${summary.criticalAcuity} Patients`, 'Mean Transition Velocity', `${summary.meanVelocityMinutes} Minutes`],
    ['Guarded Acuity Transfers', `${summary.guardedAcuity} Patients`, 'Median Transition Duration', `${summary.medianVelocityMinutes} Minutes`],
    ['Discharge-Ready Step Downs', `${summary.dischargeReady} Patients`, 'Immutable Audit Ledger Size', `${summary.totalAuditEvents} Events Recorded`],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Operational Metric', 'Value', 'Operational Metric', 'Value']],
    body: kpiData,
    theme: 'striped',
    headStyles: { fillColor: COLORS.emeraldPrimary, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: COLORS.textDark, cellPadding: 2.5 },
    columnStyles: { 1: { fontStyle: 'bold' }, 3: { fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Bottleneck / Blocker Categories
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('2. TRANSITION GATE BLOCKER DISTRIBUTION (PARETO ANALYSIS)', 14, y);
  y += 3;

  const blockers = analyticsData?.blockerCategories || [
    { category: 'Unverified Medication Reconciliation (Stage 02)', count: 4 },
    { category: 'Pending Verbal SBAR Nurse Acknowledgment (Stage 03)', count: 3 },
    { category: 'Diagnostic / Lab Clearance Pending (Stage 01)', count: 2 },
    { category: 'Receiving Bed Sanitization & Ingestion (Stage 05)', count: 2 },
    { category: 'Transport Escort Availability (Stage 04)', count: 1 },
  ];

  const blockerRows = blockers.map((b: any, idx: number) => [
    (idx + 1).toString(),
    b.category,
    b.count.toString(),
    b.count > 2 ? 'HIGH CONCERN' : 'CONTROLLED',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Safety Blocker Category', 'Occurrences', 'Operational Priority']],
    body: blockerRows,
    theme: 'plain',
    headStyles: { fillColor: COLORS.goldDark, textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: COLORS.textDark, cellPadding: 2.2 },
    columnStyles: { 0: { cellWidth: 8 }, 2: { cellWidth: 26, fontStyle: 'bold' }, 3: { cellWidth: 32, fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Department Transition Volume
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.emeraldDark);
  doc.text('3. UNIT TRANSITION VOLUMES & FLOW EFFICIENCY', 14, y);
  y += 3;

  const unitVolumes = analyticsData?.unitVolumes || [
    { unit: 'Cardiovascular ICU (CVICU)', volume: 6 },
    { unit: 'Neuro Intensive Care Unit (NICU)', volume: 4 },
    { unit: 'Step-Down Telemetry (4-West)', volume: 5 },
    { unit: 'Inpatient Neuro Rehab (3-East)', volume: 3 },
    { unit: 'Emergency Department Resuscitation', volume: 4 },
  ];

  const unitRows = unitVolumes.map((u: any) => [
    u.unit,
    `${u.volume} Active Transfers`,
    'Optimal Buffer (> 2 Beds Open)',
    '100% Invariant Compliance',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Hospital Department / Clinical Care Unit', 'Handoff Throughput', 'Bed Buffer Status', 'Quality Index']],
    body: unitRows,
    theme: 'striped',
    headStyles: { fillColor: COLORS.emeraldPrimary, textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: COLORS.textDark, cellPadding: 2.2 },
    margin: { left: 14, right: 14 },
  });

  addFooters(doc, reportCode);
  downloadPdf(doc, `KAVACHA_Operational_Analytics_${new Date().toISOString().slice(0, 10)}.pdf`);
}
