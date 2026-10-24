import React, { useState } from 'react';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  Check, 
  Truck,
  Heart,
  FileText
} from 'lucide-react';
import { CareTransition, AcuityLevel } from '../types/clinical';

interface RosterOverviewProps {
  patients: CareTransition[];
  onSelectPatient: (patient: CareTransition) => void;
  onOpenSbar: (patient: CareTransition) => void;
}

export const RosterOverview: React.FC<RosterOverviewProps> = ({
  patients,
  onSelectPatient,
  onOpenSbar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAcuity, setFilterAcuity] = useState<string>('all');

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.sourceUnit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.targetUnit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAcuity = filterAcuity === 'all' || patient.acuity === filterAcuity;

    return matchesSearch && matchesAcuity;
  });

  const criticalCount = patients.filter(p => p.acuity === 'critical').length;
  const guardedCount = patients.filter(p => p.acuity === 'guarded').length;
  const dischargeCount = patients.filter(p => p.acuity === 'discharge-ready').length;

  return (
    <div className="space-y-6">
      {/* Metric Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="emerald-glass-card rounded-xl p-4 relative overflow-hidden">
          <div className="prism-line absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6f7975] font-bold">
              Active Hospital Handoffs
            </span>
            <Activity className="w-4 h-4 text-[#267A68]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#111e1a]">{patients.length}</span>
            <span className="text-xs text-[#006150] font-semibold">Patients In Conduit</span>
          </div>
          <div className="text-[11px] text-[#6f7975] mt-1">
            Across 6 hospital departments
          </div>
        </div>

        <div className="emerald-glass-card rounded-xl p-4 relative overflow-hidden">
          <div className="prism-line-gold absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9A6500] font-bold">
              Critical & Guarded Priority
            </span>
            <Shield className="w-4 h-4 text-[#C6A15B]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#B42332]">{criticalCount}</span>
            <span className="text-xs text-[#3f4945]">Critical · <strong className="text-[#9A6500]">{guardedCount} Guarded</strong></span>
          </div>
          <div className="text-[11px] text-[#6f7975] mt-1">
            Mandatory continuous RN escort
          </div>
        </div>

        <div className="emerald-glass-card rounded-xl p-4 relative overflow-hidden">
          <div className="prism-line absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6f7975] font-bold">
              Mean Transition Velocity
            </span>
            <Clock className="w-4 h-4 text-[#006971]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#006150]">38.4</span>
            <span className="text-xs text-[#3f4945] font-semibold">minutes / handoff</span>
          </div>
          <div className="text-[11px] text-[#247A56] mt-1 font-medium">
            ↓ 14% vs institutional benchmark
          </div>
        </div>

        <div className="emerald-glass-card rounded-xl p-4 relative overflow-hidden">
          <div className="prism-line absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6f7975] font-bold">
              Protocol Shield Adherence
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#247A56]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#247A56]">97.8%</span>
            <span className="text-xs text-[#006150] font-semibold">Zero Invariant Breaches</span>
          </div>
          <div className="text-[11px] text-[#6f7975] mt-1">
            Full cryptographic verification
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="emerald-glass-card rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6f7975] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by patient name, MRN, unit, or diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white/80 border border-[#DCE7E3] focus:outline-none focus:border-[#267A68] focus:ring-1 focus:ring-[#63DCE8]"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3] overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterAcuity('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              filterAcuity === 'all'
                ? 'bg-white text-[#006150] shadow-2xs font-bold'
                : 'text-[#6f7975] hover:text-[#111e1a]'
            }`}
          >
            All ({patients.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterAcuity('critical')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              filterAcuity === 'critical'
                ? 'bg-[#B42332]/10 text-[#B42332] font-bold'
                : 'text-[#6f7975] hover:text-[#B42332]'
            }`}
          >
            Critical ({criticalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterAcuity('guarded')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              filterAcuity === 'guarded'
                ? 'bg-[rgba(198,161,91,0.2)] text-[#9A6500] font-bold'
                : 'text-[#6f7975] hover:text-[#9A6500]'
            }`}
          >
            Guarded ({guardedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterAcuity('discharge-ready')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              filterAcuity === 'discharge-ready'
                ? 'bg-[#e8f7f1] text-[#247A56] font-bold'
                : 'text-[#6f7975] hover:text-[#247A56]'
            }`}
          >
            Discharge Ready ({dischargeCount})
          </button>
        </div>
      </div>

      {/* Patient Transitions Matrix Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPatients.map((patient) => {
          const currentStage = patient.stages.find(s => s.id === patient.currentStageId) || patient.stages[0];
          const completedCount = patient.stages.filter(s => s.status === 'completed').length;

          return (
            <div
              key={patient.id}
              className="emerald-glass-card emerald-glass-card-hover rounded-xl p-5 relative overflow-hidden transition-all border border-[#DCE7E3]"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left: Patient and Trajectory */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold font-display text-[#111e1a]">
                      {patient.patientName}
                    </h3>
                    <span className="font-mono text-xs text-[#006150] font-medium">
                      {patient.mrn}
                    </span>
                    <span className="text-[#bec9c4]">·</span>
                    <span className="text-xs text-[#3f4945]">
                      {patient.age}y {patient.gender}
                    </span>

                    {/* Acuity tag */}
                    {patient.acuity === 'critical' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#B42332]/10 text-[#B42332] border border-[#B42332]/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B42332] optical-pulse-critical" />
                        Critical
                      </span>
                    ) : patient.acuity === 'guarded' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[rgba(198,161,91,0.18)] text-[#9A6500] border border-[#C6A15B]/30 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Guarded
                      </span>
                    ) : patient.acuity === 'discharge-ready' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#e8f7f1] text-[#247A56] border border-[#247A56]/30 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Discharge Ready
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#DDF8F8] text-[#20594B] border border-[#63DCE8]/40 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#63DCE8] optical-pulse" />
                        In-Transit
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#3f4945] font-medium leading-relaxed">
                    {patient.diagnosis}
                  </p>

                  <div className="flex items-center gap-2 text-xs pt-1">
                    <span className="text-[#6f7975] font-medium">Trajectory:</span>
                    <span className="font-semibold text-[#111e1a]">{patient.sourceUnit}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#006150]" />
                    <span className="font-bold text-[#006150]">{patient.targetUnit}</span>
                    <span className="text-xs font-mono text-[#6f7975]">({patient.targetBed})</span>
                  </div>
                </div>

                {/* Center: Stage Conduit Visualizer */}
                <div className="lg:w-[320px] bg-white/70 p-3 rounded-xl border border-[#DCE7E3]">
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-bold text-[#006150]">
                      Stage 0{patient.currentStageId}: {currentStage.shortLabel}
                    </span>
                    <span className="font-mono text-[#6f7975] text-[10px]">
                      {completedCount}/5 Gates
                    </span>
                  </div>

                  {/* Conduit Mini Dots & Rail */}
                  <div className="relative flex items-center justify-between px-2 pt-1 pb-1">
                    <div className="absolute top-[13px] left-3 right-3 h-[2px] bg-[#DCE7E3] z-0" />
                    {patient.stages.map((stg) => {
                      const isComplete = stg.status === 'completed';
                      const isActive = stg.status === 'active';
                      return (
                        <div
                          key={stg.id}
                          className="relative z-10 flex flex-col items-center"
                          title={`Stage ${stg.id}: ${stg.name} (${stg.status})`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${
                              isComplete
                                ? 'bg-[#247A56] ring-2 ring-white shadow-xs'
                                : isActive
                                ? 'bg-[#63DCE8] ring-2 ring-[#006150] shadow-sm'
                                : 'bg-[#DCE7E3] ring-2 ring-white'
                            }`}
                          >
                            {isComplete && <Check className="w-2 h-2 text-white stroke-[3]" />}
                          </div>
                          <span className="text-[9px] font-mono text-[#6f7975] mt-1">
                            S{stg.id}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-2 text-[10px] text-[#6f7975] truncate">
                    Lead: <strong className="text-[#111e1a]">{currentStage.leadDiscipline}</strong>
                  </div>
                </div>

                {/* Right: Telemetry & Actions */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-[#6f7975] block uppercase">HR / NIBP</span>
                      <span className="font-bold text-[#111e1a]">
                        {patient.telemetry.heartRate} bpm · {patient.telemetry.bloodPressure}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#6f7975] block uppercase">Transport</span>
                      <span className="font-semibold text-[#006971] flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {patient.transport.transportStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenSbar(patient)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#63DCE8] bg-white/80 hover:bg-[#DDF8F8] text-[#123B32] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#006150]" />
                      <span>SBAR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectPatient(patient)}
                      className="bg-gradient-to-b from-[#267A68] to-[#20594B] text-white px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-sm hover:brightness-105 active:scale-[0.98] border-t border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Open Canvas</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}

        {filteredPatients.length === 0 && (
          <div className="emerald-glass-card rounded-xl p-8 text-center text-[#6f7975] text-xs">
            No active transitions match the current search or acuity filter.
          </div>
        )}
      </div>
    </div>
  );
};
