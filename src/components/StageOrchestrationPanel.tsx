import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Pill, 
  Truck, 
  FileCheck, 
  Plus, 
  Check, 
  Clock, 
  ShieldAlert,
  UserCheck,
  Send,
  MessageSquare
} from 'lucide-react';
import { CareTransition, ChecklistItem, MedicationItem } from '../types/clinical';

interface StageOrchestrationPanelProps {
  patient: CareTransition;
  activeStageId: number;
  onToggleChecklist: (stageId: number, checkId: string) => void;
  onAddChecklistItem: (stageId: number, label: string, discipline: ChecklistItem['discipline']) => void;
  onAdvanceStage: () => void;
  onOpenVerificationModal: () => void;
  onToggleMedicationStatus: (medId: string) => void;
  onUpdateAuditNote: (note: string) => void;
}

export const StageOrchestrationPanel: React.FC<StageOrchestrationPanelProps> = ({
  patient,
  activeStageId,
  onToggleChecklist,
  onAddChecklistItem,
  onAdvanceStage,
  onOpenVerificationModal,
  onToggleMedicationStatus,
  onUpdateAuditNote,
}) => {
  const currentStage = patient.stages.find(s => s.id === activeStageId) || patient.stages[0];
  const [newCheckText, setNewCheckText] = useState('');
  const [newCheckDiscipline, setNewCheckDiscipline] = useState<ChecklistItem['discipline']>('Nursing');
  const [showAddForm, setShowAddForm] = useState(false);
  const [auditNoteInput, setAuditNoteInput] = useState('');

  const requiredChecks = currentStage.checklists.filter(c => c.requiredForAdvance);
  const completedRequiredChecks = requiredChecks.filter(c => c.completed);
  const canAdvance = requiredChecks.length > 0 && requiredChecks.every(c => c.completed);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckText.trim()) return;
    onAddChecklistItem(currentStage.id, newCheckText.trim(), newCheckDiscipline);
    setNewCheckText('');
    setShowAddForm(false);
  };

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditNoteInput.trim()) return;
    onUpdateAuditNote(auditNoteInput.trim());
    setAuditNoteInput('');
  };

  return (
    <div className="space-y-6">
      {/* Stage Core Card */}
      <div className="emerald-glass-card rounded-xl p-5 relative overflow-hidden">
        <div className="prism-line absolute top-0 left-0 right-0" />

        {/* Stage Title and Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#DCE7E3] gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#e2f1eb] text-[#006150] uppercase tracking-wider">
                Stage 0{currentStage.id} Verification Gate
              </span>
              <span className="text-xs text-[#6f7975]">·</span>
              <span className="text-xs font-semibold text-[#111e1a]">
                Lead: {currentStage.leadDiscipline}
              </span>
            </div>
            <h2 className="text-xl font-bold font-display text-[#111e1a]">
              {currentStage.name}
            </h2>
            <p className="text-xs text-[#3f4945] mt-1">
              {currentStage.description}
            </p>
          </div>

          {/* Gate Progression Status */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-[#6f7975] font-medium">Gate Criteria</div>
              <div className="text-sm font-bold font-mono text-[#006150]">
                {completedRequiredChecks.length} / {requiredChecks.length} Required Met
              </div>
            </div>

            {currentStage.status === 'completed' ? (
              <div className="px-3 py-1.5 rounded-lg bg-[#e8f7f1] border border-[#247A56]/40 text-[#247A56] text-xs font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Gate Sealed</span>
              </div>
            ) : canAdvance ? (
              <button
                type="button"
                onClick={onOpenVerificationModal}
                className="bg-gradient-to-b from-[#267A68] to-[#20594B] text-white px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-[0_4px_16px_rgba(38,122,104,0.35)] hover:brightness-105 active:scale-[0.98] border-t border-white/20 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#63DCE8]" />
                <span>Sign & Advance Gate</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-lg bg-[#FAF8F1] border border-[#DCE7E3] text-[#6f7975] text-xs font-medium flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[#9A6500]" />
                <span>Pending Clearances</span>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Checklist Table */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-[#006150] flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4" />
              <span>Multi-Disciplinary Verification Checklist</span>
            </h3>

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-semibold text-[#006971] hover:text-[#006150] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Protocol Item</span>
            </button>
          </div>

          {/* Add Item Inline Form */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="mb-4 p-3 bg-[#FAF8F1] rounded-lg border border-[#63DCE8]/60 space-y-2">
              <div className="text-xs font-bold text-[#111e1a]">Add Custom Stage Checklist Item</div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. Verify portable suction canister and Yankauer catheter..."
                  value={newCheckText}
                  onChange={(e) => setNewCheckText(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 rounded-md bg-white border border-[#DCE7E3] focus:outline-none focus:border-[#267A68] focus:ring-2 focus:ring-[#63DCE8]/30"
                />
                <select
                  value={newCheckDiscipline}
                  onChange={(e) => setNewCheckDiscipline(e.target.value as ChecklistItem['discipline'])}
                  className="text-xs px-2.5 py-1.5 rounded-md bg-white border border-[#DCE7E3] focus:outline-none cursor-pointer"
                >
                  <option value="Nursing">Nursing</option>
                  <option value="Physician">Physician</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Physical Therapy">Physical Therapy</option>
                  <option value="Case Management">Case Management</option>
                  <option value="Transport">Transport</option>
                </select>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#267A68] rounded-md hover:bg-[#20594B]"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-2 py-1.5 text-xs text-[#6f7975] hover:text-[#111e1a]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Checklist Items list */}
          <div className="divide-y divide-[#DCE7E3]/70 border border-[#DCE7E3] rounded-lg bg-white/70 overflow-hidden">
            {currentStage.checklists.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleChecklist(currentStage.id, item.id)}
                className={`p-3.5 flex items-start justify-between gap-3 transition-colors cursor-pointer group ${
                  item.completed ? 'bg-[#e8f7f1]/30 hover:bg-[#e8f7f1]/50' : 'hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    type="button"
                    className="mt-0.5 text-[#006150] focus:outline-none"
                    aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {item.completed ? (
                      <CheckSquare className="w-5 h-5 text-[#247A56] fill-[#247A56]/10" />
                    ) : (
                      <Square className="w-5 h-5 text-[#6f7975] group-hover:text-[#267A68]" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.2 rounded-full bg-[#e2f1eb] text-[#006150]">
                        {item.discipline}
                      </span>
                      {item.requiredForAdvance && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#9A6500] bg-[rgba(198,161,91,0.15)] px-1.5 py-0.2 rounded">
                          Mandatory Gate
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1 leading-snug ${
                        item.completed ? 'text-[#3f4945] font-medium' : 'text-[#111e1a] font-semibold'
                      }`}
                    >
                      {item.label}
                    </p>

                    {item.notes && (
                      <p className="text-[11px] text-[#9A6500] italic mt-0.5">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {item.completed ? (
                    <div className="text-[11px]">
                      <span className="text-[#247A56] font-semibold flex items-center gap-1 justify-end">
                        <Check className="w-3 h-3" />
                        Signed
                      </span>
                      <span className="text-[10px] text-[#6f7975] block">
                        {item.completedBy || 'Clinician Staff'}
                      </span>
                      {item.timestamp && (
                        <span className="text-[10px] font-mono text-[#6f7975]">
                          {item.timestamp}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono font-semibold text-[#6f7975] group-hover:text-[#006150]">
                      Click to sign
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage Progression Action Footer */}
        <div className="mt-5 pt-4 border-t border-[#DCE7E3] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#3f4945]">
            Protocol Invariant Guard: All mandatory criteria must be stamped prior to physical transport custody transfer.
          </div>

          <div className="flex items-center gap-2">
            {currentStage.id < patient.stages.length && (
              <button
                type="button"
                onClick={onAdvanceStage}
                disabled={!canAdvance}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
                  canAdvance
                    ? 'bg-[#267A68] hover:bg-[#20594B] text-white shadow-sm cursor-pointer'
                    : 'bg-[#DCE7E3] text-[#6f7975] cursor-not-allowed opacity-60'
                }`}
              >
                <span>Advance to Stage 0{currentStage.id + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stage-Specific Deep Dive Sub-Panels */}

      {/* STAGE 2: Medication Reconciliation Matrix */}
      {currentStage.id === 2 && (
        <div className="emerald-glass-card rounded-xl p-5 relative">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#DCE7E3]">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#267A68]" />
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#006150]">
                Medication Transition & High-Alert Matrix
              </h3>
            </div>
            <span className="text-xs font-mono text-[#6f7975]">
              {patient.medications.length} Monitored Regimens
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#DCE7E3] text-[#6f7975] font-semibold uppercase text-[10px]">
                  <th className="py-2 px-3">Medication & Dose</th>
                  <th className="py-2 px-3">Route / Schedule</th>
                  <th className="py-2 px-3">Clinical Action</th>
                  <th className="py-2 px-3">Attestation</th>
                  <th className="py-2 px-3 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE7E3]/60 bg-white/50">
                {patient.medications.map((med) => (
                  <tr key={med.id} className="hover:bg-white/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#111e1a]">{med.name}</div>
                      <div className="text-[11px] font-mono text-[#3f4945]">{med.dose}</div>
                      {med.notes && (
                        <div className="text-[10px] text-[#9A6500] italic mt-0.5">{med.notes}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-[#111e1a] font-medium">{med.route}</div>
                      <div className="text-[11px] text-[#6f7975]">{med.frequency}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          med.reconciliationStatus === 'verified'
                            ? 'bg-[#e8f7f1] text-[#247A56]'
                            : med.reconciliationStatus === 'adjusted'
                            ? 'bg-[rgba(198,161,91,0.15)] text-[#9A6500]'
                            : 'bg-[#B42332]/10 text-[#B42332]'
                        }`}
                      >
                        {med.reconciliationStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#3f4945] text-[11px]">
                      {med.verifiedBy || 'Pending Dual Sign'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onToggleMedicationStatus(med.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-white border border-[#DCE7E3] hover:border-[#267A68] hover:text-[#006150] transition-colors cursor-pointer shadow-2xs"
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STAGE 3: SBAR Handshake Interactive Preview */}
      {currentStage.id === 3 && (
        <div className="emerald-glass-card rounded-xl p-5 relative">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#DCE7E3]">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#267A68]" />
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#006150]">
                Nurse-to-Nurse SBAR Verbal Tele-Handshake
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#006150]">
              <span className="w-2 h-2 rounded-full bg-[#247A56]" />
              <span>Receiving Bed: {patient.targetBed}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3]">
              <span className="font-bold text-[#006150] uppercase tracking-wider text-[10px] block mb-1">
                S · Situation
              </span>
              <p className="text-[#111e1a] leading-relaxed">{patient.sbar.situation}</p>
            </div>

            <div className="p-3 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3]">
              <span className="font-bold text-[#006150] uppercase tracking-wider text-[10px] block mb-1">
                B · Background
              </span>
              <p className="text-[#111e1a] leading-relaxed">{patient.sbar.background}</p>
            </div>

            <div className="p-3 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3]">
              <span className="font-bold text-[#006150] uppercase tracking-wider text-[10px] block mb-1">
                A · Assessment
              </span>
              <p className="text-[#111e1a] leading-relaxed">{patient.sbar.assessment}</p>
            </div>

            <div className="p-3 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3]">
              <span className="font-bold text-[#006150] uppercase tracking-wider text-[10px] block mb-1">
                R · Recommendation
              </span>
              <p className="text-[#111e1a] leading-relaxed">{patient.sbar.recommendation}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DCE7E3] flex flex-wrap items-center justify-between text-xs text-[#3f4945] gap-2">
            <div className="flex items-center gap-3">
              <span>Sending RN: <strong className="text-[#111e1a]">{patient.sbar.sendingNurse}</strong></span>
              <span aria-hidden="true" className="text-[#bec9c4]">·</span>
              <span>Receiving RN: <strong className="text-[#111e1a]">{patient.sbar.receivingNurse}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: Transport Safeguards & Escort Logistics */}
      {currentStage.id === 4 && (
        <div className="emerald-glass-card rounded-xl p-5 relative">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#DCE7E3]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#267A68]" />
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#006150]">
                Transport Safeguard & Route Logistics
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#DDF8F8] text-[#20594B] border border-[#63DCE8]/40">
                Status: {patient.transport.transportStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-4">
            <div className="p-3 bg-white/70 rounded-lg border border-[#DCE7E3]">
              <span className="text-[10px] text-[#6f7975] block uppercase font-bold">Transport Mode</span>
              <span className="text-sm font-bold text-[#111e1a] mt-0.5 block">{patient.transport.mode}</span>
              <span className="text-[11px] text-[#3f4945]">Scheduled: {patient.transport.scheduledTime}</span>
            </div>

            <div className="p-3 bg-white/70 rounded-lg border border-[#DCE7E3]">
              <span className="text-[10px] text-[#6f7975] block uppercase font-bold">Bedside Escort Team</span>
              <span className="text-sm font-bold text-[#006150] mt-0.5 block">{patient.transport.escortTeam}</span>
              <span className="text-[11px] text-[#3f4945]">
                {patient.transport.escortRequired ? 'Mandatory RN Escort Assigned' : 'Unescorted Porter'}
              </span>
            </div>

            <div className="p-3 bg-white/70 rounded-lg border border-[#DCE7E3]">
              <span className="text-[10px] text-[#6f7975] block uppercase font-bold">ETA Countdown</span>
              <span className="text-sm font-bold font-mono text-[#006971] mt-0.5 block">
                {patient.transport.etaMinutes > 0 ? `${patient.transport.etaMinutes} minutes` : 'Bedside Transfer Imminent'}
              </span>
              <span className="text-[11px] text-[#6f7975]">Route: Dedicated West Service Elevators</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-[#111e1a] block mb-2">Required Equipment Accompanying Patient:</span>
            <div className="flex flex-wrap gap-2">
              {patient.transport.equipment.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#e8f7f1] text-[#006150] border border-[#bec9c4]/50 flex items-center gap-1.5"
                >
                  <Check className="w-3 h-3 text-[#247A56]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 5: Receiving Ingestion & Verification Seal */}
      {currentStage.id === 5 && (
        <div className="emerald-glass-card rounded-xl p-5 relative">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#DCE7E3]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#267A68]" />
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#006150]">
                Final KAVACHA Care Shield Certification Seal
              </h3>
            </div>
            <span className="text-xs font-mono text-[#247A56] font-bold">
              100% Invariant Compliance Target
            </span>
          </div>

          <p className="text-xs text-[#3f4945] mb-4">
            Once physical arrival vitals are recorded and both sending and receiving clinical custodians sign off,
            this care transition is permanently locked into the hospital cryptographic audit rail.
          </p>

          <div className="p-4 rounded-xl bg-gradient-to-r from-[#e8f7f1] to-[#e2f1eb] border border-[#247A56]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-[#006150] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#247A56]" />
                <span>Transition Custody Status</span>
              </div>
              <div className="text-sm font-semibold text-[#111e1a]">
                Awaiting final physical bed handshake at {patient.targetUnit}
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenVerificationModal}
              className="bg-gradient-to-b from-[#267A68] to-[#20594B] text-white px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-[0_4px_16px_rgba(38,122,104,0.35)] hover:brightness-105 active:scale-[0.98] border-t border-white/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 text-[#63DCE8]" />
              <span>Execute Final KAVACHA Lock</span>
            </button>
          </div>
        </div>
      )}

      {/* Clinical Audit Note & Fast Communication */}
      <div className="emerald-glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold font-display uppercase tracking-wider text-[#111e1a] flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#006150]" />
            <span>Transition Audit Trail Note</span>
          </h4>
          <span className="text-[11px] text-[#6f7975] font-mono">Shift Coordinator Log</span>
        </div>

        <div className="p-3 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3] text-xs mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6f7975] block mb-1">
            Current Clinical Note:
          </span>
          <p className="text-[#111e1a] font-medium leading-relaxed">
            {patient.lastAuditNote}
          </p>
        </div>

        <form onSubmit={handleAuditSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Add coordinator handover addendum or telemetry update..."
            value={auditNoteInput}
            onChange={(e) => setAuditNoteInput(e.target.value)}
            className="flex-1 text-xs px-3 py-2 rounded-lg bg-white border border-[#DCE7E3] focus:outline-none focus:border-[#267A68] focus:ring-2 focus:ring-[#63DCE8]/20"
          />
          <button
            type="submit"
            className="bg-[#267A68] hover:bg-[#20594B] text-white px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>Append</span>
          </button>
        </form>
      </div>
    </div>
  );
};
