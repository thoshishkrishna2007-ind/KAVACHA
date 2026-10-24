import React, { useState } from 'react';
import { X, ShieldPlus, AlertCircle } from 'lucide-react';
import { CareTransition, AcuityLevel } from '../types/clinical';

interface NewTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (newPatient: CareTransition) => void;
}

export const NewTransitionModal: React.FC<NewTransitionModalProps> = ({
  isOpen,
  onClose,
  onAddPatient,
}) => {
  const [patientName, setPatientName] = useState('');
  const [mrn, setMrn] = useState('MRN-9102-33');
  const [age, setAge] = useState(58);
  const [gender, setGender] = useState<'F' | 'M' | 'Other'>('M');
  const [diagnosis, setDiagnosis] = useState('');
  const [sourceUnit, setSourceUnit] = useState('Surgical ICU');
  const [targetUnit, setTargetUnit] = useState('Step-Down Surgical Ward');
  const [targetBed, setTargetBed] = useState('3S-04');
  const [acuity, setAcuity] = useState<AcuityLevel>('guarded');
  const [codeStatus, setCodeStatus] = useState<CareTransition['codeStatus']>('FULL CODE');
  const [coordinator, setCoordinator] = useState('Sarah Jensen, BSN, CCRN');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !diagnosis.trim()) return;

    const newTransition: CareTransition = {
      id: `tr-${Date.now().toString().slice(-4)}`,
      patientId: `PT-${Math.floor(10000 + Math.random() * 90000)}`,
      patientName: patientName.trim(),
      mrn: mrn.trim() || `MRN-${Math.floor(1000 + Math.random() * 9000)}-01`,
      age: Number(age) || 50,
      gender,
      admissionDate: new Date().toISOString().split('T')[0],
      diagnosis: diagnosis.trim(),
      sourceUnit,
      targetUnit,
      targetBed,
      acuity,
      shieldScore: 95.0,
      currentStageId: 1,
      telemetry: {
        heartRate: 78,
        bloodPressure: '120/80',
        spo2: 98,
        respiratoryRate: 16,
        meanArterialPressure: 93,
        cardiacRhythm: 'Normal Sinus Rhythm',
        temperature: 37.0,
        lastUpdated: 'Just now'
      },
      allergies: ['NKDA (No Known Drug Allergies)'],
      codeStatus,
      fallRisk: 'Moderate',
      isolationType: 'None',
      estimatedHandoffDuration: '30 min',
      assignedCoordinator: coordinator,
      lastAuditNote: 'Transition protocol initiated. Baseline telemetry and readiness criteria under review.',
      medications: [
        {
          id: `med-${Date.now()}-1`,
          name: 'Cefazolin IV',
          dose: '2 g',
          route: 'IV',
          frequency: 'Q8H',
          category: 'antibiotic',
          reconciliationStatus: 'verified',
          verifiedBy: 'Clinical Pharmacy'
        },
        {
          id: `med-${Date.now()}-2`,
          name: 'Enoxaparin (Lovenox)',
          dose: '40 mg',
          route: 'SubQ',
          frequency: 'Daily',
          category: 'anticoagulant',
          reconciliationStatus: 'verified',
          verifiedBy: 'Clinical Pharmacy'
        }
      ],
      stages: [
        {
          id: 1,
          name: 'Clinical Readiness & Baseline Telemetry',
          shortLabel: 'Readiness',
          description: 'Hemodynamic evaluation, airway tolerance, laboratory clearance.',
          leadDiscipline: 'Attending Physician & Primary Nursing',
          status: 'active',
          checklists: [
            { id: 'c-new-1', label: 'Hemodynamic stability sustained without pressors for > 4 hours', discipline: 'Nursing', completed: true, completedBy: 'RN Coordinator', requiredForAdvance: true },
            { id: 'c-new-2', label: 'Attending physician transfer order electronically signed', discipline: 'Physician', completed: false, requiredForAdvance: true },
            { id: 'c-new-3', label: 'Diagnostic lab tests & morning panel reviewed', discipline: 'Physician', completed: true, completedBy: 'Resident MD', requiredForAdvance: true }
          ]
        },
        {
          id: 2,
          name: 'Medication Reconciliation & High-Alert Signoff',
          shortLabel: 'Pharm Shield',
          description: 'Multidisciplinary pharmacy review and order reconciliation.',
          leadDiscipline: 'Clinical Pharmacy',
          status: 'pending',
          checklists: [
            { id: 'c-new-4', label: 'Pharmacy discharge/transfer medication orders verified', discipline: 'Pharmacy', completed: false, requiredForAdvance: true },
            { id: 'c-new-5', label: 'Narcotics and controlled substances count verified at bedside', discipline: 'Nursing', completed: false, requiredForAdvance: true }
          ]
        },
        {
          id: 3,
          name: 'Receiving Handshake & Nurse-to-Nurse SBAR',
          shortLabel: 'SBAR Handshake',
          description: 'Direct verbal transfer report with receiving unit RN.',
          leadDiscipline: 'Nursing Care Coordination',
          status: 'pending',
          checklists: [
            { id: 'c-new-6', label: 'Receiving bed confirmed sanitized, prepped, and staffed', discipline: 'Nursing', completed: false, requiredForAdvance: true },
            { id: 'c-new-7', label: 'Verbal SBAR report delivered and acknowledged', discipline: 'Nursing', completed: false, requiredForAdvance: true }
          ]
        },
        {
          id: 4,
          name: 'Transport Safeguard & Escort Logistics',
          shortLabel: 'Transport',
          description: 'Safe transit monitoring, oxygen cylinder check, escort assignment.',
          leadDiscipline: 'Patient Transport',
          status: 'pending',
          checklists: [
            { id: 'c-new-8', label: 'Transport equipment pre-flight check completed', discipline: 'Transport', completed: false, requiredForAdvance: true }
          ]
        },
        {
          id: 5,
          name: 'Receiving Ingestion & Verification Seal',
          shortLabel: 'Shield Locked',
          description: 'Arrival telemetry synchronization and mutual signoff.',
          leadDiscipline: 'Receiving Unit Staff',
          status: 'pending',
          checklists: [
            { id: 'c-new-9', label: 'Patient placed on receiving telemetry and safe bed transfer confirmed', discipline: 'Nursing', completed: false, requiredForAdvance: true }
          ]
        }
      ],
      sbar: {
        situation: `${patientName}, ${age}-year-old ${gender} diagnosed with ${diagnosis}, transitioning from ${sourceUnit} to ${targetUnit}.`,
        background: `Admitted on ${new Date().toISOString().split('T')[0]}. Under active care coordination. Code status ${codeStatus}.`,
        assessment: 'Hemodynamically stable on room air/supplemental O2. Alert, oriented. Baseline vitals within target parameters.',
        recommendation: `Transfer to ${targetUnit} bed ${targetBed}. Continue daily telemetry and physical therapy as ordered.`,
        sendingNurse: coordinator,
        receivingNurse: 'Receiving Unit Charge RN',
        attendingPhysician: 'Staff Attending Physician'
      },
      transport: {
        mode: 'Stretcher',
        escortRequired: true,
        escortTeam: 'Primary RN + Transport Tech',
        equipment: ['Portable Telemetry Monitor', 'Oxygen Tank'],
        scheduledTime: 'Pending Clearance',
        etaMinutes: 30,
        transportStatus: 'Scheduled'
      }
    };

    onAddPatient(newTransition);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#DCE7E3] overflow-hidden text-[#111e1a]">
        
        {/* Header */}
        <div className="bg-[#FAF8F1] border-b border-[#DCE7E3] p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-b from-[#267A68] to-[#123B32] flex items-center justify-center text-white shadow-xs">
              <ShieldPlus className="w-5 h-5 text-[#63DCE8]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#006150] font-bold">
                Clinical Workflow
              </span>
              <h3 className="text-lg font-bold font-display text-[#111e1a]">
                Initiate New Care Transition Protocol
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6f7975] hover:text-[#111e1a] hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#3f4945] mb-1">
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Robert Vance"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F1] border border-[#DCE7E3] focus:outline-none focus:border-[#267A68] focus:ring-1 focus:ring-[#63DCE8]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#3f4945] mb-1">
                Medical Record Number (MRN)
              </label>
              <input
                type="text"
                value={mrn}
                onChange={(e) => setMrn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F1] border border-[#DCE7E3] font-mono focus:outline-none focus:border-[#267A68]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#3f4945] mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F1] border border-[#DCE7E3] focus:outline-none focus:border-[#267A68]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#3f4945] mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F1] border border-[#DCE7E3] focus:outline-none"
              >
                <option value="F">Female</option>
                <option value="M">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#3f4945] mb-1">Acuity Level</label>
              <select
                value={acuity}
                onChange={(e) => setAcuity(e.target.value as AcuityLevel)}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F1] border border-[#DCE7E3] focus:outline-none font-semibold text-[#006150]"
              >
                <option value="guarded">Guarded / Protected</option>
                <option value="critical">Critical</option>
                <option value="stable">Stable In-Transit</option>
                <option value="discharge-ready">Discharge Ready</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#3f4945] mb-1">
              Primary Diagnosis / Clinical Rationale *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Post-Lap Cholecystectomy with Bile Duct Exploration, Ready for Step-Down"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#FAF8F1] border border-[#DCE7E3] focus:outline-none focus:border-[#267A68]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#3f4945] mb-1">
                Source Unit (Current)
              </label>
              <input
                type="text"
                value={sourceUnit}
                onChange={(e) => setSourceUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F1] border border-[#DCE7E3] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#3f4945] mb-1">
                Destination Unit & Bed
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#FAF8F1] border border-[#DCE7E3] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Bed"
                  value={targetBed}
                  onChange={(e) => setTargetBed(e.target.value)}
                  className="w-20 px-2 py-2 rounded-lg bg-[#FAF8F1] border border-[#DCE7E3] text-center font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#3f4945] mb-1">
                Code Status
              </label>
              <select
                value={codeStatus}
                onChange={(e) => setCodeStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F1] border border-[#DCE7E3] focus:outline-none"
              >
                <option value="FULL CODE">FULL CODE</option>
                <option value="DNR">DNR (Do Not Resuscitate)</option>
                <option value="DNI">DNI (Do Not Intubate)</option>
                <option value="DNR/DNI">DNR / DNI</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#3f4945] mb-1">
                Assigned Care Coordinator
              </label>
              <input
                type="text"
                value={coordinator}
                onChange={(e) => setCoordinator(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF8F1] border border-[#DCE7E3] focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#DCE7E3] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#6f7975] hover:text-[#111e1a] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-b from-[#267A68] to-[#20594B] text-white px-5 py-2 text-xs font-semibold rounded-lg shadow-md hover:brightness-105 active:scale-[0.98] border-t border-white/20 transition-all cursor-pointer"
            >
              Launch KAVACHA Protocol
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
