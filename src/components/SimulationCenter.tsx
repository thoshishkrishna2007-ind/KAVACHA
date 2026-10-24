import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Activity,
  Pill,
  Truck,
  Bed
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface SimulationCenterProps {
  onScenarioExecuted: (scenarioName: string) => void;
}

export const SimulationCenter: React.FC<SimulationCenterProps> = ({ onScenarioExecuted }) => {
  const { currentRole, switchRole } = useAuth();
  const [selectedScenario, setSelectedScenario] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState<{ time: string; text: string; type: 'info' | 'success' | 'warn' | 'error' }[]>([
    { time: 'System Ready', text: 'Clinical Simulation Engine initialized in synthetic testing mode.', type: 'info' }
  ]);

  const SCENARIOS = [
    {
      id: 'A',
      title: 'Scenario A: Successful Full-Cycle Transition',
      badge: 'Golden Path',
      color: 'text-[#247A56]',
      border: 'border-[#247A56]',
      icon: CheckCircle2,
      description: 'Eleanor Vance (Post-CABG) completes remaining clinical milestones, nurse-to-nurse SBAR verbal handshake, gurney transport with wireless telemetry, and receives physical arrival confirmation at 4-West Telemetry.',
      expectedResult: 'All 5 stages advance to Completed with 100% adherence seal. Patient marked Discharge Ready.',
    },
    {
      id: 'B',
      title: 'Scenario B: High-Alert Medication Blocker',
      badge: 'Safety Blocker',
      color: 'text-[#9A6500]',
      border: 'border-[#C6A15B]',
      icon: Pill,
      description: 'Amara Okafor (Severe Preeclampsia) has an un-reconciled high-alert medication (Labetalol IV) and pending blood bank cross-match. The system halts Stage 02 advance until a certified Pharmacist reviews and attests.',
      expectedResult: 'System returns HTTP 400 blocked state with explicit safety rationale. Pharmacist role required to sign.',
    },
    {
      id: 'C',
      title: 'Scenario C: Biometric Deterioration Alert',
      badge: 'Vital Alert',
      color: 'text-[#B42332]',
      border: 'border-[#B42332]',
      icon: Activity,
      description: 'Marcus Chen (Neuro ICU) suffers sudden synthetic acute decompensation (BP 84/52, MAP 62 mmHg, HR 128 bpm). Automated safety threshold violation halts transfer and triggers emergency clinical huddle.',
      expectedResult: 'Critical telemetry alert banner, priority notification pushed to care coordinator, transport suspended.',
    },
    {
      id: 'D',
      title: 'Scenario D: Transport Delay & Revised ETA',
      badge: 'Logistics',
      color: 'text-[#006971]',
      border: 'border-[#63DCE8]',
      icon: Truck,
      description: 'Donald Reyes inter-facility BLS ambulance is held at prior hospital emergency. Transport dispatcher logs a 45-minute delay, notifying receiving Pinecrest SNF intake nurse automatically.',
      expectedResult: 'Countdown updated to 45 min, transport status updated to Scheduled (Delayed), audit entry created.',
    },
    {
      id: 'E',
      title: 'Scenario E: Receiving-Team Unit Rejection',
      badge: 'Handoff Reversal',
      color: 'text-[#B42332]',
      border: 'border-[#B42332]',
      icon: XCircle,
      description: 'Receiving 4-West charge nurse rejects handoff due to unexpected telemetry monitoring technician call-out and staffing ratio constraints. The system rolls back to Stage 03 while preserving all prior records.',
      expectedResult: 'Transition returned to review state with explanatory audit log; zero records erased.',
    },
  ];

  const currentScenarioMeta = SCENARIOS.find(s => s.id === selectedScenario)!;

  const handleRunScenario = async () => {
    setIsExecuting(true);
    const now = new Date().toLocaleTimeString();
    
    setExecutionLog(prev => [
      { time: now, text: `Triggering synthetic execution: ${currentScenarioMeta.title}...`, type: 'info' },
      ...prev
    ]);

    try {
      const res = await api.executeScenario(selectedScenario);
      const resTime = new Date().toLocaleTimeString();

      setExecutionLog(prev => [
        { time: resTime, text: `RESULT: ${res.message}`, type: 'success' },
        ...prev
      ]);

      onScenarioExecuted(currentScenarioMeta.title);
    } catch (err: any) {
      setExecutionLog(prev => [
        { time: new Date().toLocaleTimeString(), text: `ERROR: ${err.message}`, type: 'error' },
        ...prev
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleResetDatabase = async () => {
    try {
      await api.resetDemoDatabase();
      setExecutionLog(prev => [
        { time: new Date().toLocaleTimeString(), text: 'DATABASE RESET: All patients, telemetry, stages, and audit trails restored to baseline.', type: 'warn' },
        ...prev
      ]);
      onScenarioExecuted('Database Reset');
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    }
  };

  return (
    <div className="emerald-glass-card rounded-xl p-5 relative overflow-hidden">
      <div className="prism-line absolute top-0 left-0 right-0" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DCE7E3] gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-[#267A68] to-[#123B32] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-[#63DCE8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#006150]">
                Clinical Safety Simulation Center
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#DDF8F8] text-[#006150] border border-[#63DCE8]/40">
                Hackathon Test Rig
              </span>
            </div>
            <p className="text-xs text-[#3f4945]">
              Deterministic synthetic scenarios demonstrating clinical safety gates, blocker resolution, and audit tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDatabase}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#DCE7E3] bg-white hover:bg-[#FAF8F1] text-[#3f4945] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset database to clean seed state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Baseline</span>
          </button>
        </div>
      </div>

      {/* Scenario Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-4">
        {SCENARIOS.map(s => {
          const isSelected = selectedScenario === s.id;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedScenario(s.id as any)}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#267A68] shadow-sm ring-1 ring-[#267A68]/30'
                  : 'bg-white/50 border-[#DCE7E3] hover:bg-white/80'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold font-mono uppercase text-[#006150]">
                  {s.id}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${s.color}`}>
                  {s.badge}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                <span className="text-xs font-bold text-[#111e1a] truncate">
                  {s.title.split(':')[1]?.trim() || s.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Scenario Detail Card */}
      <div className="p-4 rounded-xl bg-white/80 border border-[#DCE7E3] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono text-[#006150] font-bold uppercase">
              Selected Synthetic Scenario
            </span>
            <h4 className="text-base font-bold font-display text-[#111e1a]">
              {currentScenarioMeta.title}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {selectedScenario === 'B' && currentRole !== 'pharmacist' && (
              <button
                type="button"
                onClick={() => switchRole('pharmacist')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[rgba(198,161,91,0.2)] text-[#9A6500] border border-[#C6A15B]/50 hover:brightness-105 transition-colors cursor-pointer"
              >
                Switch to Pharmacist Role
              </button>
            )}

            <button
              type="button"
              onClick={handleRunScenario}
              disabled={isExecuting}
              className="bg-gradient-to-b from-[#267A68] to-[#20594B] text-white px-5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-[0_4px_16px_rgba(38,122,104,0.35)] hover:brightness-105 active:scale-[0.98] border-t border-white/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Executing Scenario...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#63DCE8] fill-[#63DCE8]" />
                  <span>Execute {currentScenarioMeta.title.split(':')[0]}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-[#3f4945] leading-relaxed">
          {currentScenarioMeta.description}
        </p>

        <div className="p-2.5 rounded-lg bg-[#FAF8F1] border border-[#DCE7E3] text-xs">
          <span className="text-[10px] font-mono uppercase text-[#6f7975] font-bold block mb-0.5">
            Expected Safety Outcome:
          </span>
          <p className="text-[#111e1a] font-medium">
            {currentScenarioMeta.expectedResult}
          </p>
        </div>
      </div>

      {/* Synthetic Execution Timeline Log */}
      <div className="mt-4 pt-3 border-t border-[#DCE7E3]">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-[#111e1a]">Simulation Event Log:</span>
          <span className="text-[10px] font-mono text-[#6f7975]">Real-time Event Stream</span>
        </div>

        <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[11px] p-2 bg-[#123B32] text-white rounded-lg border border-[#63DCE8]/30">
          {executionLog.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-[#63DCE8] shrink-0">[{log.time}]</span>
              <span
                className={
                  log.type === 'success'
                    ? 'text-[#86d5c0]'
                    : log.type === 'warn'
                    ? 'text-[#ffdea5]'
                    : log.type === 'error'
                    ? 'text-[#ffdad6]'
                    : 'text-white/80'
                }
              >
                {log.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
