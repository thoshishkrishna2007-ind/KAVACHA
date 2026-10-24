import React from 'react';
import { Check, AlertCircle, ShieldCheck, Clock } from 'lucide-react';
import { TransitionStage } from '../types/clinical';

interface TransitionConduitProps {
  stages: TransitionStage[];
  activeStageId: number;
  onSelectStage: (stageId: number) => void;
  patientName: string;
  sourceUnit: string;
  targetUnit: string;
  shieldScore: number;
}

export const TransitionConduit: React.FC<TransitionConduitProps> = ({
  stages,
  activeStageId,
  onSelectStage,
  patientName,
  sourceUnit,
  targetUnit,
  shieldScore,
}) => {
  const completedStagesCount = stages.filter(s => s.status === 'completed').length;
  const currentStage = stages.find(s => s.id === activeStageId) || stages[0];

  return (
    <div className="emerald-glass-card rounded-xl p-5 mb-6 relative overflow-hidden">
      {/* Prism Refraction Accent Line */}
      <div className="prism-line absolute top-0 left-0 right-0" />

      {/* Header bar of conduit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#DCE7E3] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#006150]">
              Transition Pathway Conduit
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#e8f7f1] text-[#006150] border border-[#bec9c4]/50">
              {completedStagesCount} of {stages.length} Gates Verified
            </span>
          </div>
          <p className="text-xs text-[#3f4945] mt-0.5">
            Synchronized clinical handoff from <span className="font-semibold text-[#111e1a]">{sourceUnit}</span> to{' '}
            <span className="font-semibold text-[#111e1a]">{targetUnit}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 bg-[#FAF8F1] px-2.5 py-1 rounded-md border border-[#DCE7E3]">
            <ShieldCheck className="w-4 h-4 text-[#267A68]" />
            <span className="text-[#3f4945] font-medium">KAVACHA Safety Index:</span>
            <span className="font-bold font-mono text-[#006150]">{shieldScore}%</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-[#3f4945]">
            <Clock className="w-3.5 h-3.5 text-[#6f7975]" />
            <span>Target Velocity: <span className="font-semibold text-[#111e1a]">40 min</span></span>
          </div>
        </div>
      </div>

      {/* The Stepped Node-and-Rail Conduit */}
      <div className="relative pt-2 pb-3 px-2 sm:px-6">
        {/* Background Connecting Rail (2px hairline) */}
        <div className="absolute top-[28px] left-[32px] right-[32px] sm:left-[56px] sm:right-[56px] h-[2px] bg-[#DCE7E3] z-0" />

        {/* Dynamic Progress Rail (Green filling line) */}
        <div 
          className="absolute top-[28px] left-[32px] sm:left-[56px] h-[2px] bg-[#247A56] z-0 transition-all duration-500"
          style={{
            width: `${Math.max(0, Math.min(100, (completedStagesCount / (stages.length - 1)) * 88))}%`
          }}
        />

        {/* Stages Grid */}
        <div className="grid grid-cols-5 relative z-10 gap-1 sm:gap-2">
          {stages.map((stage, index) => {
            const isCompleted = stage.status === 'completed';
            const isActive = stage.status === 'active';
            const isPending = stage.status === 'pending';
            const isFlagged = stage.status === 'flagged';
            const isSelected = stage.id === activeStageId;

            // Count completed checklist items
            const totalChecks = stage.checklists.length;
            const completedChecks = stage.checklists.filter(c => c.completed).length;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectStage(stage.id)}
                className={`flex flex-col items-center text-center group cursor-pointer focus:outline-none transition-transform ${
                  isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
              >
                {/* Node Container (24px clickable target centering the 12px circular node) */}
                <div className="relative flex items-center justify-center w-8 h-8 mb-2">
                  {/* Concentric optical pulse rings for Active stage */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full border border-[#63DCE8] optical-pulse bg-[#63DCE8]/15" />
                  )}

                  {/* Complete stage aura */}
                  {isCompleted && (
                    <div className="absolute inset-1 rounded-full bg-[#247A56]/10" />
                  )}

                  {/* 12px Core State Node as specified */}
                  <div
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                      isCompleted
                        ? 'bg-[#247A56] shadow-[0_0_8px_rgba(36,122,86,0.6)] ring-2 ring-white'
                        : isActive
                        ? 'bg-[#63DCE8] shadow-[0_0_10px_rgba(99,220,232,0.8)] ring-2 ring-[#006150]'
                        : isFlagged
                        ? 'bg-[#B42332] shadow-[0_0_8px_rgba(180,35,50,0.6)] ring-2 ring-white'
                        : 'bg-[#DCE7E3] ring-2 ring-white'
                    }`}
                  >
                    {isCompleted && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </div>

                  {/* Selection indicator triangle */}
                  {isSelected && (
                    <div className="absolute -bottom-1.5 w-1.5 h-1.5 rotate-45 bg-[#006150]" />
                  )}
                </div>

                {/* Stage Info Cardlet */}
                <div
                  className={`w-full max-w-[170px] p-2 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-white border-[#267A68] shadow-sm ring-1 ring-[#267A68]/30'
                      : 'bg-white/50 border-transparent hover:bg-white/80 hover:border-[#DCE7E3]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#6f7975] uppercase">
                      Stage 0{stage.id}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-[#e8f7f1] text-[#247A56]'
                          : isActive
                          ? 'bg-[#DDF8F8] text-[#006971] border border-[#63DCE8]/50'
                          : 'bg-[#e2f1eb]/50 text-[#6f7975]'
                      }`}
                    >
                      {isCompleted ? 'Verified' : isActive ? 'In Progress' : 'Pending'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#111e1a] truncate leading-tight mb-1" title={stage.name}>
                    {stage.shortLabel}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#6f7975]">
                    <span>{completedChecks}/{totalChecks} checks</span>
                    {stage.verifiedAt ? (
                      <span className="font-mono text-[10px] text-[#247A56]">{stage.verifiedAt}</span>
                    ) : (
                      <span className="text-[10px] text-[#3f4945] truncate max-w-[50px]">{stage.leadDiscipline.split(' ')[0]}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Stage Banner bar */}
      <div className="mt-3 pt-3 border-t border-[#DCE7E3]/60 flex flex-col md:flex-row md:items-center justify-between text-xs text-[#3f4945] gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#111e1a]">Selected Gate:</span>
          <span className="font-semibold text-[#006150]">Stage {currentStage.id}: {currentStage.name}</span>
          <span aria-hidden="true" className="text-[#bec9c4]">·</span>
          <span>Lead: <strong className="text-[#111e1a]">{currentStage.leadDiscipline}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          {currentStage.status === 'completed' && currentStage.verifiedBy && (
            <span className="text-[#247A56] flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5" />
              Verified by {currentStage.verifiedBy} ({currentStage.verifiedAt})
            </span>
          )}
          {currentStage.status === 'active' && (
            <span className="text-[#006971] flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#63DCE8] optical-pulse" />
              Active Target Completion: {currentStage.targetCompletionTime || 'Next 30 min'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
