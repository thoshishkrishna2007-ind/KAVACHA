import { CareTransition } from '../types/clinical';
import { UserRole, ReadinessBreakdown } from '../types/backend';

export type { ReadinessBreakdown };

export function calculateReadiness(transition: CareTransition): ReadinessBreakdown {
  const currentStage = transition.stages.find(s => s.id === transition.currentStageId) || transition.stages[0];

  let mandatoryTotal = 0;
  let mandatoryMet = 0;
  let optionalTotal = 0;
  let optionalMet = 0;
  const unmetMandatory: ReadinessBreakdown['unmetMandatoryItems'] = [];
  const blockers: string[] = [];

  // Stage component scores calculation
  const stageScores: number[] = [0, 0, 0, 0, 0];

  transition.stages.forEach((stage, idx) => {
    let stageMandatoryTotal = 0;
    let stageMandatoryMet = 0;
    let stageOptionalTotal = 0;
    let stageOptionalMet = 0;

    stage.checklists.forEach(item => {
      if (item.requiredForAdvance) {
        mandatoryTotal++;
        stageMandatoryTotal++;
        if (item.completed) {
          mandatoryMet++;
          stageMandatoryMet++;
        } else {
          unmetMandatory.push({
            stageId: stage.id,
            stageName: stage.name,
            itemLabel: item.label,
            discipline: item.discipline,
          });
          if (stage.id === transition.currentStageId) {
            blockers.push(`[${item.discipline}] ${item.label}`);
          }
        }
      } else {
        optionalTotal++;
        stageOptionalTotal++;
        if (item.completed) {
          optionalMet++;
          stageOptionalMet++;
        }
      }
    });

    const totalStagePoints = (stageMandatoryTotal * 2) + stageOptionalTotal;
    const earnedStagePoints = (stageMandatoryMet * 2) + stageOptionalMet;
    stageScores[idx] = totalStagePoints > 0 ? Math.round((earnedStagePoints / totalStagePoints) * 100) : 100;
  });

  // Weighted overall calculation: 20% + 25% + 20% + 20% + 15% = 100%
  const weightedOverall = Math.round(
    (stageScores[0] * 0.20) +
    (stageScores[1] * 0.25) +
    (stageScores[2] * 0.20) +
    (stageScores[3] * 0.20) +
    (stageScores[4] * 0.15)
  );

  // Check specific gate blockers for current stage
  const currentRequiredChecks = currentStage.checklists.filter(c => c.requiredForAdvance);
  const currentRequiredMet = currentRequiredChecks.every(c => c.completed);

  // Specialized blockers by stage
  if (transition.currentStageId === 2) {
    const unverifiedMeds = transition.medications.filter(m => m.reconciliationStatus === 'pending');
    if (unverifiedMeds.length > 0) {
      blockers.push(`Pending pharmacist reconciliation for: ${unverifiedMeds.map(m => m.name).join(', ')}`);
    }
  }

  if (transition.currentStageId === 3) {
    if (!transition.sbar.receivingNurse || transition.sbar.receivingNurse.includes('Awaiting')) {
      blockers.push('Verbal SBAR report acknowledgment from receiving unit charge nurse required.');
    }
  }

  const canAdvance = currentRequiredMet && blockers.length === 0;

  const explanation = blockers.length > 0
    ? `Stage 0${currentStage.id} cannot advance: ${blockers.length} mandatory clinical gate(s) unresolved. High overall readiness (${weightedOverall}%) cannot override unmet mandatory safety requirements.`
    : `All Stage 0${currentStage.id} mandatory invariants verified. Authorized to seal gate and transition to Stage 0${Math.min(5, currentStage.id + 1)}.`;

  return {
    overallScore: weightedOverall,
    canAdvanceCurrentStage: canAdvance,
    stageBlockers: blockers,
    mandatoryCriteriaTotal: mandatoryTotal,
    mandatoryCriteriaMet: mandatoryMet,
    optionalCriteriaTotal: optionalTotal,
    optionalCriteriaMet: optionalMet,
    componentScores: {
      clinicalReview: stageScores[0],
      medicationReconciliation: stageScores[1],
      sbarHandshake: stageScores[2],
      transportReadiness: stageScores[3],
      receivingIngestion: stageScores[4],
    },
    unmetMandatoryItems: unmetMandatory,
    explanation,
  };
}

export function validateStageAdvancePermission(
  currentStageId: number,
  userRole: UserRole
): { allowed: boolean; reason?: string } {
  if (userRole === 'admin') {
    return { allowed: true };
  }

  switch (currentStageId) {
    case 1:
      if (userRole !== 'physician' && userRole !== 'nurse') {
        return {
          allowed: false,
          reason: 'Stage 01 Clinical Review gate requires Physician or Primary Nurse authorization.',
        };
      }
      return { allowed: true };

    case 2:
      if (userRole !== 'pharmacist') {
        return {
          allowed: false,
          reason: 'Stage 02 Medication Reconciliation gate requires a Clinical Pharmacist digital attestation.',
        };
      }
      return { allowed: true };

    case 3:
      if (userRole !== 'nurse' && userRole !== 'receiving_nurse') {
        return {
          allowed: false,
          reason: 'Stage 03 SBAR Handoff requires Primary Nurse or Receiving Nurse mutual signoff.',
        };
      }
      return { allowed: true };

    case 4:
      if (userRole !== 'transport' && userRole !== 'nurse') {
        return {
          allowed: false,
          reason: 'Stage 04 Transport Readiness requires Transport Specialist or Transport Escort RN authorization.',
        };
      }
      return { allowed: true };

    case 5:
      if (userRole !== 'receiving_nurse') {
        return {
          allowed: false,
          reason: 'Stage 05 Receiving Confirmation gate requires Receiving Unit Charge RN physical intake signature.',
        };
      }
      return { allowed: true };

    default:
      return { allowed: true };
  }
}
