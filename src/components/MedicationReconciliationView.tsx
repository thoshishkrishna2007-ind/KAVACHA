import React, { useState } from 'react';
import { 
  Pill, 
  ShieldAlert, 
  Check, 
  AlertTriangle, 
  Atom, 
  ExternalLink, 
  Plus, 
  FileCheck,
  Search,
  Info,
  X
} from 'lucide-react';
import { CareTransition, MedicationItem } from '../types/clinical';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DrugPharmacologyProfile } from '../types/backend';

interface MedicationReconciliationViewProps {
  patient: CareTransition;
  onMedicationUpdated: (updatedPatient: CareTransition) => void;
}

export const MedicationReconciliationView: React.FC<MedicationReconciliationViewProps> = ({
  patient,
  onMedicationUpdated,
}) => {
  const { currentRole, canAttestMedications } = useAuth();
  const [selectedMedForScience, setSelectedMedForScience] = useState<MedicationItem | null>(null);
  const [scienceProfile, setScienceProfile] = useState<DrugPharmacologyProfile | null>(null);
  const [loadingScience, setLoadingScience] = useState(false);
  const [newMedFormOpen, setNewMedFormOpen] = useState(false);

  // New med state
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedRoute, setNewMedRoute] = useState('Oral');
  const [newMedFreq, setNewMedFreq] = useState('Daily');
  const [newMedCat, setNewMedCat] = useState<MedicationItem['category']>('maintenance');

  const handleInspectScience = async (med: MedicationItem) => {
    setSelectedMedForScience(med);
    setLoadingScience(true);
    setScienceProfile(null);
    try {
      const profile = await api.getDrugPharmacology(med.name);
      setScienceProfile(profile);
    } catch (err) {
      console.error('Failed to load pharmacology profile:', err);
    } finally {
      setLoadingScience(false);
    }
  };

  const handleToggleMedStatus = async (medId: string, currentStatus: string) => {
    if (!canAttestMedications) {
      alert(`Permission Denied: Only a Pharmacist or Physician demo account can reconcile medications. Current active role is: ${currentRole.toUpperCase()}`);
      return;
    }

    const nextStatus = currentStatus === 'verified' ? 'adjusted' : 'verified';
    try {
      const updated = await api.updateMedication(patient.id, medId, nextStatus);
      onMedicationUpdated(updated);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleAttestAllMeds = async () => {
    if (!canAttestMedications) {
      alert(`Permission Denied: Pharmacist license required to attest full medication reconciliation. Current role: ${currentRole.toUpperCase()}`);
      return;
    }

    try {
      let currentPatient = patient;
      for (const med of patient.medications) {
        if (med.reconciliationStatus === 'pending') {
          currentPatient = await api.updateMedication(patient.id, med.id, 'verified', 'Attested by Pharmacist');
        }
      }
      onMedicationUpdated(currentPatient);
    } catch (err: any) {
      alert(`Attestation failed: ${err.message}`);
    }
  };

  const pendingCount = patient.medications.filter(m => m.reconciliationStatus === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="emerald-glass-card rounded-xl p-5 relative overflow-hidden">
        <div className="prism-line absolute top-0 left-0 right-0" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DCE7E3] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-b from-[#267A68] to-[#123B32] text-white flex items-center justify-center shadow-xs">
              <Pill className="w-5 h-5 text-[#63DCE8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display text-[#111e1a]">
                  Clinical Medication Reconciliation & High-Alert Matrix
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#DDF8F8] text-[#006150] border border-[#63DCE8]/40">
                  Bioscience Grounded
                </span>
              </div>
              <p className="text-xs text-[#3f4945]">
                Cross-checking inpatient regimen against transition step-down orders. Integrated with openFDA boxed warnings and PubChem chemical registries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAttestAllMeds}
              disabled={pendingCount === 0 || !canAttestMedications}
              className="bg-gradient-to-b from-[#267A68] to-[#20594B] text-white px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm hover:brightness-105 active:scale-[0.98] border-t border-white/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileCheck className="w-3.5 h-3.5 text-[#63DCE8]" />
              <span>Attest All ({pendingCount} Pending)</span>
            </button>
          </div>
        </div>

        {/* Pharmacist Role Status Alert */}
        {!canAttestMedications && (
          <div className="mt-3 p-2.5 rounded-lg bg-[rgba(198,161,91,0.15)] border border-[#C6A15B]/30 text-xs flex items-center justify-between gap-2 text-[#9A6500]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Current role: <strong>{currentRole.toUpperCase()}</strong>. Medication reconciliation attestation requires the <strong>Pharmacist</strong> demo role.</span>
            </div>
            <span className="text-[11px] font-mono underline">Switch in Header</span>
          </div>
        )}
      </div>

      {/* Medication List Table */}
      <div className="emerald-glass-card rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE7E3]">
          <h4 className="text-xs font-bold font-display uppercase tracking-wider text-[#006150]">
            Active Transition Regimens ({patient.medications.length})
          </h4>
          <span className="text-[11px] font-mono text-[#6f7975]">
            Click "Bio-Science" on any row to view PubChem 2D structure & openFDA warnings
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#DCE7E3] text-[#6f7975] font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Medication & Dose</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Route & Schedule</th>
                <th className="py-2.5 px-3">Reconciliation Status</th>
                <th className="py-2.5 px-3">Attested By</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE7E3]/60 bg-white/50">
              {patient.medications.map((med) => {
                const isHighAlert = med.category === 'anticoagulant' || med.category === 'infusion';
                return (
                  <tr key={med.id} className="hover:bg-white/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#111e1a]">{med.name}</span>
                        {isHighAlert && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#B42332]/10 text-[#B42332] border border-[#B42332]/25">
                            High Alert
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#3f4945]">{med.dose}</div>
                      {med.notes && (
                        <div className="text-[10px] text-[#9A6500] italic mt-0.5">{med.notes}</div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="capitalize font-mono text-[11px] text-[#3f4945]">
                        {med.category}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-[#111e1a]">{med.route}</div>
                      <div className="text-[10px] text-[#6f7975]">{med.frequency}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          med.reconciliationStatus === 'verified'
                            ? 'bg-[#e8f7f1] text-[#247A56]'
                            : med.reconciliationStatus === 'adjusted'
                            ? 'bg-[rgba(198,161,91,0.18)] text-[#9A6500]'
                            : med.reconciliationStatus === 'discontinued'
                            ? 'bg-black/10 text-[#6f7975]'
                            : 'bg-[#B42332]/10 text-[#B42332]'
                        }`}
                      >
                        {med.reconciliationStatus}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[#3f4945] text-[11px]">
                      {med.verifiedBy || <span className="text-[#B42332] font-semibold">Pending Review</span>}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleInspectScience(med)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#DDF8F8] text-[#006971] border border-[#63DCE8]/50 hover:bg-[#63DCE8]/20 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Atom className="w-3 h-3" />
                          <span>Bio-Science</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleMedStatus(med.id, med.reconciliationStatus)}
                          disabled={!canAttestMedications}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-white border border-[#DCE7E3] hover:border-[#267A68] hover:text-[#006150] transition-colors cursor-pointer disabled:opacity-40"
                        >
                          {med.reconciliationStatus === 'verified' ? 'Re-adjust' : 'Attest ✓'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bioscience Modal Inspector for Selected Drug */}
      {selectedMedForScience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#DCE7E3] overflow-hidden text-[#111e1a]">
            {/* Header */}
            <div className="bg-[#FAF8F1] border-b border-[#DCE7E3] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#123B32] text-white flex items-center justify-center shadow-xs">
                  <Atom className="w-5 h-5 text-[#63DCE8]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#006150] font-bold">
                      Google DeepMind Science Skill
                    </span>
                    <span className="text-[#bec9c4]">·</span>
                    <span className="text-xs text-[#6f7975] font-mono">PubChem & openFDA Knowledge Engine</span>
                  </div>
                  <h3 className="text-base font-bold font-display text-[#111e1a]">
                    {selectedMedForScience.name} — Pharmacology Dossier
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMedForScience(null)}
                className="p-1.5 rounded-lg text-[#6f7975] hover:text-[#111e1a] hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {loadingScience ? (
                <div className="py-12 text-center text-[#6f7975]">
                  <div className="w-6 h-6 border-2 border-[#267A68] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Querying PubChem PUG REST and openFDA regulatory label databases...
                </div>
              ) : scienceProfile ? (
                <>
                  {/* Chemical Structure & Molecular Properties */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#FAF8F1] border border-[#DCE7E3]">
                    {/* 2D Molecular Structure from PubChem */}
                    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-[#DCE7E3]">
                      <span className="text-[10px] font-mono uppercase text-[#6f7975] mb-1">
                        PubChem 2D Structure
                      </span>
                      {scienceProfile.chemicalStructure2dUrl ? (
                        <img
                          src={scienceProfile.chemicalStructure2dUrl}
                          alt={`${selectedMedForScience.name} chemical structure`}
                          className="w-32 h-32 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-32 h-32 flex items-center justify-center text-[#6f7975]">No Structure</div>
                      )}
                      <span className="text-[10px] font-mono text-[#006150] mt-1 font-semibold">
                        CID: {scienceProfile.pubchemCid || 'Verified'}
                      </span>
                    </div>

                    {/* Molecular Data */}
                    <div className="sm:col-span-2 space-y-2">
                      <span className="text-[10px] font-mono uppercase text-[#6f7975] font-bold block">
                        Biochemical Identifiers
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-white rounded-md border border-[#DCE7E3]">
                          <span className="text-[10px] text-[#6f7975] block">Molecular Formula</span>
                          <span className="font-mono font-bold text-[#111e1a]">{scienceProfile.molecularFormula}</span>
                        </div>
                        <div className="p-2 bg-white rounded-md border border-[#DCE7E3]">
                          <span className="text-[10px] text-[#6f7975] block">Molecular Weight</span>
                          <span className="font-mono font-bold text-[#111e1a]">{scienceProfile.molecularWeight}</span>
                        </div>
                      </div>

                      <div className="p-2 bg-white rounded-md border border-[#DCE7E3]">
                        <span className="text-[10px] text-[#6f7975] block font-mono">Canonical SMILES</span>
                        <span className="font-mono text-[11px] text-[#006150] break-all">
                          {scienceProfile.canonicalSmiles}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* FDA Boxed Warnings */}
                  <div className="p-4 rounded-xl bg-[#B42332]/5 border border-[#B42332]/25 space-y-1">
                    <div className="flex items-center gap-2 text-[#B42332] font-bold text-xs uppercase tracking-wider">
                      <ShieldAlert className="w-4 h-4" />
                      <span>openFDA Regulatory Black Box Warning</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#111e1a] font-medium pt-1">
                      {scienceProfile.fdaBoxedWarning}
                    </p>
                  </div>

                  {/* Contraindications & Interactions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3]">
                      <span className="text-[10px] font-bold uppercase text-[#6f7975] block mb-1">
                        Contraindications:
                      </span>
                      <p className="text-xs text-[#3f4945] leading-relaxed">
                        {scienceProfile.contraindications}
                      </p>
                    </div>

                    <div className="p-3 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3]">
                      <span className="text-[10px] font-bold uppercase text-[#6f7975] block mb-1">
                        Drug-Drug Interactions:
                      </span>
                      <p className="text-xs text-[#3f4945] leading-relaxed">
                        {scienceProfile.drugInteractions}
                      </p>
                    </div>
                  </div>

                  {/* Clinical Monitoring Protocol */}
                  <div className="p-3 bg-[#e8f7f1] rounded-lg border border-[#247A56]/30 text-xs">
                    <span className="font-bold text-[#006150] uppercase text-[10px] tracking-wider block mb-0.5">
                      Recommended Transition Safeguard Protocol:
                    </span>
                    <p className="text-[#111e1a] font-medium leading-relaxed">
                      {scienceProfile.monitoringProtocol}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-xs text-[#6f7975]">
                  Failed to load pharmacology profile.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#FAF8F1] border-t border-[#DCE7E3] p-4 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedMedForScience(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#267A68] hover:bg-[#20594B] text-white transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
