import React from 'react';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Heart, 
  Wind, 
  Thermometer, 
  UserCheck, 
  ArrowRight, 
  RefreshCw,
  FileText,
  Lock,
  PhoneCall,
  Bed,
  CheckCircle2
} from 'lucide-react';
import { CareTransition } from '../types/clinical';

interface PatientSidebarProps {
  patient: CareTransition;
  onOpenVerificationModal: () => void;
  onOpenSbarModal: () => void;
  onSimulateTelemetry: () => void;
  isSimulatingTelemetry?: boolean;
}

export const PatientSidebar: React.FC<PatientSidebarProps> = ({
  patient,
  onOpenVerificationModal,
  onOpenSbarModal,
  onSimulateTelemetry,
  isSimulatingTelemetry = false,
}) => {
  // Render status chip per design spec
  const renderAcuityTag = () => {
    switch (patient.acuity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#B42332]/10 text-[#B42332] border border-[#B42332]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B42332] optical-pulse-critical" />
            Critical Acuity
          </span>
        );
      case 'guarded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[rgba(198,161,91,0.18)] text-[#9A6500] border border-[#C6A15B]/30">
            <Shield className="w-3 h-3 text-[#9A6500]" />
            Guarded / Protected
          </span>
        );
      case 'discharge-ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#e8f7f1] text-[#247A56] border border-[#247A56]/30">
            <CheckCircle2 className="w-3 h-3 text-[#247A56]" />
            Discharge Ready
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#DDF8F8] text-[#20594B] border border-[#63DCE8]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#63DCE8] optical-pulse" />
            In-Transit
          </span>
        );
    }
  };

  return (
    <aside className="w-full lg:w-[320px] shrink-0 space-y-4">
      {/* Patient Identity Card */}
      <div className="emerald-glass-card rounded-xl p-4 relative overflow-hidden">
        <div className="prism-line absolute top-0 left-0 right-0" />

        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="text-lg font-bold font-display text-[#111e1a] leading-tight">
              {patient.patientName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-[#3f4945] mt-0.5">
              <span className="font-mono font-medium text-[#006150]">{patient.mrn}</span>
              <span aria-hidden="true">·</span>
              <span>{patient.age}y {patient.gender}</span>
              <span aria-hidden="true">·</span>
              <span>Adm: {patient.admissionDate}</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 mb-3">
          {renderAcuityTag()}
        </div>

        {/* Diagnosis */}
        <div className="p-2.5 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3] text-xs">
          <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#6f7975] block mb-1">
            Primary Clinical Diagnosis
          </span>
          <p className="font-medium text-[#111e1a] leading-relaxed">
            {patient.diagnosis}
          </p>
        </div>

        {/* Transfer Trajectory */}
        <div className="mt-3 pt-3 border-t border-[#DCE7E3] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6f7975] font-medium">Source:</span>
            <span className="font-semibold text-[#111e1a] text-right truncate max-w-[200px]" title={patient.sourceUnit}>
              {patient.sourceUnit}
            </span>
          </div>

          <div className="flex items-center justify-center my-0.5 text-[#006150]">
            <ArrowRight className="w-4 h-4 animate-pulse" />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6f7975] font-medium">Target Bed:</span>
            <span className="font-semibold text-[#006150] flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-[#006971]" />
              {patient.targetBed}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Biometric Telemetry */}
      <div className="emerald-glass-card rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#DCE7E3]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#63DCE8] optical-pulse" />
            <h4 className="text-xs font-bold font-display uppercase tracking-wider text-[#006150]">
              Continuous Telemetry
            </h4>
          </div>
          <button
            type="button"
            onClick={onSimulateTelemetry}
            className="text-[11px] font-mono text-[#267A68] hover:text-[#006150] flex items-center gap-1 transition-colors"
            title="Refresh / simulate telemetry reading"
          >
            <RefreshCw className={`w-3 h-3 ${isSimulatingTelemetry ? 'animate-spin' : ''}`} />
            <span>{patient.telemetry.lastUpdated}</span>
          </button>
        </div>

        {/* Telemetry Waveform simulation SVG */}
        <div className="bg-[#123B32] rounded-lg p-2.5 mb-3 text-white border border-[#63DCE8]/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#63DCE8] mb-1">
            <span>LEAD II · 25mm/s</span>
            <span>{patient.telemetry.cardiacRhythm.split('·')[0].trim()}</span>
          </div>
          
          {/* Animated SVG Waveform */}
          <div className="h-10 w-full overflow-hidden flex items-center">
            <svg viewBox="0 0 300 40" className="w-full h-full text-[#63DCE8] stroke-current fill-none stroke-[1.75]">
              <path d="M 0,20 L 30,20 L 35,20 L 40,16 L 45,24 L 50,20 L 55,20 L 60,7 L 65,34 L 70,14 L 75,20 L 80,20 L 90,20 L 95,16 L 105,20 L 140,20 L 145,20 L 150,16 L 155,24 L 160,20 L 165,20 L 170,7 L 175,34 L 180,14 L 185,20 L 190,20 L 200,20 L 205,16 L 215,20 L 250,20 L 255,20 L 260,16 L 265,24 L 270,20 L 275,20 L 280,7 L 285,34 L 290,14 L 295,20 L 300,20" />
            </svg>
          </div>
          <div className="text-[10px] text-[#86d5c0] truncate font-mono mt-0.5">
            {patient.telemetry.cardiacRhythm}
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Heart Rate */}
          <div className="p-2 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3]">
            <div className="flex items-center gap-1.5 text-[#6f7975] text-[10px] uppercase font-bold tracking-wider mb-0.5">
              <Heart className="w-3 h-3 text-[#B42332]" />
              <span>Heart Rate</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-[#111e1a]">
                {patient.telemetry.heartRate}
              </span>
              <span className="text-[10px] text-[#6f7975] font-mono">BPM</span>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="p-2 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3]">
            <div className="flex items-center gap-1.5 text-[#6f7975] text-[10px] uppercase font-bold tracking-wider mb-0.5">
              <Activity className="w-3 h-3 text-[#267A68]" />
              <span>NIBP (Sys/Dia)</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono text-[#111e1a]">
                {patient.telemetry.bloodPressure}
              </span>
              <span className="text-[10px] text-[#6f7975] font-mono">mmHg</span>
            </div>
          </div>

          {/* SpO2 */}
          <div className="p-2 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3]">
            <div className="flex items-center gap-1.5 text-[#6f7975] text-[10px] uppercase font-bold tracking-wider mb-0.5">
              <Wind className="w-3 h-3 text-[#006971]" />
              <span>SpO2 Oximetry</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-[#111e1a]">
                {patient.telemetry.spo2}
              </span>
              <span className="text-[10px] text-[#6f7975] font-mono">%</span>
            </div>
          </div>

          {/* MAP */}
          <div className="p-2 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3]">
            <div className="flex items-center gap-1.5 text-[#6f7975] text-[10px] uppercase font-bold tracking-wider mb-0.5">
              <Activity className="w-3 h-3 text-[#6d5011]" />
              <span>Mean MAP</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-[#111e1a]">
                {patient.telemetry.meanArterialPressure}
              </span>
              <span className="text-[10px] text-[#6f7975] font-mono">mmHg</span>
            </div>
          </div>

          {/* Resp Rate */}
          <div className="p-2 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3]">
            <div className="flex items-center gap-1.5 text-[#6f7975] text-[10px] uppercase font-bold tracking-wider mb-0.5">
              <Wind className="w-3 h-3 text-[#6f7975]" />
              <span>Resp Rate</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold font-mono text-[#111e1a]">
                {patient.telemetry.respiratoryRate}
              </span>
              <span className="text-[10px] text-[#6f7975] font-mono">/min</span>
            </div>
          </div>

          {/* Temp */}
          <div className="p-2 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3]">
            <div className="flex items-center gap-1.5 text-[#6f7975] text-[10px] uppercase font-bold tracking-wider mb-0.5">
              <Thermometer className="w-3 h-3 text-[#6f7975]" />
              <span>Core Temp</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold font-mono text-[#111e1a]">
                {patient.telemetry.temperature}
              </span>
              <span className="text-[10px] text-[#6f7975] font-mono">°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Safeguard Flags */}
      <div className="emerald-glass-card rounded-xl p-4 text-xs space-y-2.5">
        <h4 className="text-[11px] font-bold font-display uppercase tracking-wider text-[#111e1a]">
          Guardianship & Safeguards
        </h4>

        {/* Code Status */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#DCE7E3]">
          <span className="text-[#6f7975] font-medium">Code Status:</span>
          <span className="font-bold text-[#111e1a] font-mono">{patient.codeStatus}</span>
        </div>

        {/* Allergies */}
        <div className="p-2 rounded-lg bg-white border border-[#DCE7E3]">
          <div className="flex items-center gap-1 text-[#B42332] font-bold text-[10px] uppercase tracking-wider mb-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Documented Allergies</span>
          </div>
          <div className="space-y-0.5">
            {patient.allergies.map((allergy, idx) => (
              <span key={idx} className="block text-xs font-semibold text-[#111e1a]">
                {allergy}
              </span>
            ))}
          </div>
        </div>

        {/* Fall Risk & Isolation */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-white border border-[#DCE7E3]">
            <span className="text-[10px] text-[#6f7975] block uppercase font-medium">Fall Risk</span>
            <span className="font-bold text-[#111e1a]">{patient.fallRisk} Risk</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-[#DCE7E3]">
            <span className="text-[10px] text-[#6f7975] block uppercase font-medium">Precautions</span>
            <span className="font-bold text-[#111e1a]">
              {patient.isolationType === 'None' ? 'Standard' : patient.isolationType}
            </span>
          </div>
        </div>

        {/* Assigned Team */}
        <div className="pt-2 border-t border-[#DCE7E3] space-y-1 text-[11px] text-[#3f4945]">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#267A68]" />
            <span>Coord: <strong className="text-[#111e1a]">{patient.assignedCoordinator}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-[#006971]" />
            <span>Attending: <strong className="text-[#111e1a]">{patient.sbar.attendingPhysician}</strong></span>
          </div>
        </div>
      </div>

      {/* Fast Action Buttons */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={onOpenVerificationModal}
          className="w-full bg-gradient-to-b from-[#267A68] to-[#20594B] text-white p-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(38,122,104,0.35)] hover:brightness-105 active:scale-[0.98] border-t border-white/20 transition-all cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5 text-[#63DCE8]" />
          <span>Lock KAVACHA Verification Gate</span>
        </button>

        <button
          type="button"
          onClick={onOpenSbarModal}
          className="w-full bg-white/70 hover:bg-[#DDF8F8] border border-[#63DCE8] text-[#123B32] p-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-[#006150]" />
          <span>Full SBAR Handoff Brief</span>
        </button>
      </div>
    </aside>
  );
};
