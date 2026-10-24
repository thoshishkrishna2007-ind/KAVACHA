import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  HelpCircle, 
  Info, 
  Lock, 
  Unlock, 
  BarChart3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ReadinessBreakdown } from '../types/backend';
import { CareTransition } from '../types/clinical';

interface ReadinessEnginePanelProps {
  readiness: ReadinessBreakdown;
  patient: CareTransition;
}

export const ReadinessEnginePanel: React.FC<ReadinessEnginePanelProps> = ({
  readiness,
  patient,
}) => {
  const [showFormula, setShowFormula] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#247A56] bg-[#e8f7f1] border-[#247A56]/30';
    if (score >= 70) return 'text-[#9A6500] bg-[rgba(198,161,91,0.18)] border-[#C6A15B]/30';
    return 'text-[#B42332] bg-[#B42332]/10 border-[#B42332]/30';
  };

  return (
    <div className="emerald-glass-card rounded-xl p-5 relative overflow-hidden mb-6">
      {/* Top subtle refraction line */}
      <div className="prism-line absolute top-0 left-0 right-0" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DCE7E3] gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#267A68] text-white flex items-center justify-center shadow-xs">
            <BarChart3 className="w-4 h-4 text-[#63DCE8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#006150]">
                Explainable Transition Readiness Engine
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#FAF8F1] border border-[#DCE7E3] text-[#3f4945]">
                Deterministic Rule-Based
              </span>
            </div>
            <p className="text-xs text-[#3f4945]">
              Objective protocol verification index evaluating multi-disciplinary readiness and stage invariants.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFormula(!showFormula)}
          className="text-xs font-semibold text-[#006971] hover:text-[#006150] flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showFormula ? 'Hide Formula' : 'How Score Is Calculated'}</span>
          {showFormula ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Formula & Rule Transparency Accordion */}
      {showFormula && (
        <div className="my-3 p-3.5 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3] text-xs space-y-2 animate-fade-in">
          <div className="flex items-start gap-2 text-[#006150] font-bold">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Documented Weighting Architecture & Non-Override Invariant:</span>
          </div>
          <p className="text-[#3f4945] leading-relaxed">
            Overall Readiness Score is composed of 5 weighted pillars:
            <strong> Clinical Review (20%)</strong> + 
            <strong> Medication Reconciliation (25%)</strong> + 
            <strong> SBAR Handshake (20%)</strong> + 
            <strong> Transport Readiness (20%)</strong> + 
            <strong> Receiving Confirmation (15%)</strong>.
          </p>
          <div className="p-2 rounded bg-white border border-[#B42332]/30 text-[#B42332] text-[11px] font-semibold">
            CRITICAL SAFETY INVARIANT: A high aggregate readiness score (e.g. 95%) NEVER permits physical transport or stage advancement if any mandatory gate item remains unresolved.
          </div>
        </div>
      )}

      {/* Main Readiness Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
        
        {/* Overall Readiness Score Card */}
        <div className="p-4 rounded-xl bg-white/80 border border-[#DCE7E3] flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6f7975] font-bold">
            Weighted Readiness Index
          </span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#111e1a]">
              {readiness.overallScore}%
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getScoreColor(readiness.overallScore)}`}>
              {readiness.overallScore >= 90 ? 'High Acuity Ready' : readiness.overallScore >= 70 ? 'In Preparation' : 'Blocked / Incomplete'}
            </span>
          </div>
          <div className="text-[11px] text-[#6f7975]">
            Mandatory criteria: <strong>{readiness.mandatoryCriteriaMet}/{readiness.mandatoryCriteriaTotal}</strong> satisfied
          </div>
        </div>

        {/* Gate Authorization Status */}
        <div className="p-4 rounded-xl bg-white/80 border border-[#DCE7E3] flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6f7975] font-bold">
            Stage 0{patient.currentStageId} Clearance Gate
          </span>
          <div className="my-2 flex items-center gap-2">
            {readiness.canAdvanceCurrentStage ? (
              <div className="flex items-center gap-1.5 text-[#247A56] font-bold text-sm">
                <Unlock className="w-5 h-5" />
                <span>Cleared to Advance</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#B42332] font-bold text-sm">
                <Lock className="w-5 h-5" />
                <span>Gate Sealed / Blocked</span>
              </div>
            )}
          </div>
          <div className="text-[11px] text-[#3f4945]">
            {readiness.stageBlockers.length === 0
              ? 'All stage safety conditions met'
              : `${readiness.stageBlockers.length} active blocker(s) present`}
          </div>
        </div>

        {/* 5-Pillar Score Mini Meters */}
        <div className="md:col-span-2 p-4 rounded-xl bg-white/80 border border-[#DCE7E3] space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6f7975] font-bold block mb-1">
            Pillar Breakdown
          </span>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
            <div>
              <div className="flex justify-between text-[#3f4945] mb-0.5">
                <span>Clinical Review (20%)</span>
                <span className="font-mono font-bold">{readiness.componentScores.clinicalReview}%</span>
              </div>
              <div className="h-1.5 bg-[#DCE7E3] rounded-full overflow-hidden">
                <div className="h-full bg-[#267A68] rounded-full" style={{ width: `${readiness.componentScores.clinicalReview}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#3f4945] mb-0.5">
                <span>Med Recon (25%)</span>
                <span className="font-mono font-bold">{readiness.componentScores.medicationReconciliation}%</span>
              </div>
              <div className="h-1.5 bg-[#DCE7E3] rounded-full overflow-hidden">
                <div className="h-full bg-[#006971] rounded-full" style={{ width: `${readiness.componentScores.medicationReconciliation}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#3f4945] mb-0.5">
                <span>SBAR Handshake (20%)</span>
                <span className="font-mono font-bold">{readiness.componentScores.sbarHandshake}%</span>
              </div>
              <div className="h-1.5 bg-[#DCE7E3] rounded-full overflow-hidden">
                <div className="h-full bg-[#247A56] rounded-full" style={{ width: `${readiness.componentScores.sbarHandshake}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#3f4945] mb-0.5">
                <span>Transport Ready (20%)</span>
                <span className="font-mono font-bold">{readiness.componentScores.transportReadiness}%</span>
              </div>
              <div className="h-1.5 bg-[#DCE7E3] rounded-full overflow-hidden">
                <div className="h-full bg-[#6d5011] rounded-full" style={{ width: `${readiness.componentScores.transportReadiness}%` }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Active Stage Blockers Banner (if any) */}
      {readiness.stageBlockers.length > 0 && (
        <div className="p-3.5 rounded-lg bg-[#B42332]/5 border border-[#B42332]/25 text-xs">
          <div className="flex items-center gap-2 text-[#B42332] font-bold mb-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Unresolved Mandatory Safety Blockers for Stage 0{patient.currentStageId}:</span>
          </div>
          <ul className="space-y-1 pl-6 list-disc text-[#111e1a] font-medium">
            {readiness.stageBlockers.map((blocker, idx) => (
              <li key={idx} className="leading-snug">
                {blocker}
              </li>
            ))}
          </ul>
        </div>
      )}

      {readiness.stageBlockers.length === 0 && (
        <div className="p-3 rounded-lg bg-[#e8f7f1] border border-[#247A56]/30 text-xs flex items-center gap-2 text-[#247A56] font-semibold">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>All mandatory criteria for Stage 0{patient.currentStageId} verified. Stage is authorized for advancement.</span>
        </div>
      )}
    </div>
  );
};
