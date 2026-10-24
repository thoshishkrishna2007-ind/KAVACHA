import React, { useState } from 'react';
import { Shield, X, Check, Lock, Key, AlertTriangle } from 'lucide-react';
import { TransitionStage } from '../types/clinical';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: TransitionStage;
  patientName: string;
  mrn: string;
  onConfirmVerification: (signerName: string, witnessName: string, pin: string) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  stage,
  patientName,
  mrn,
  onConfirmVerification,
}) => {
  const [signerName, setSignerName] = useState('Sarah Jensen, BSN, RN, CCRN');
  const [witnessName, setWitnessName] = useState('Brenda Hayes, BSN, RN, PCCN');
  const [pin, setPin] = useState('8842');
  const [agreed, setAgreed] = useState(true);
  const [isSealing, setIsSealing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim() || !pin.trim() || !agreed) return;

    setIsSealing(true);
    setTimeout(() => {
      onConfirmVerification(signerName, witnessName, pin);
      setIsSealing(false);
      onClose();
    }, 600);
  };

  const shieldHash = `KAVACHA-${stage.id}X-${mrn.replace('MRN-', '')}-${Math.floor(Date.now() / 1000).toString(16).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Holographic Floating Shield Dialog (Level 3) */}
      <div className="w-full max-w-lg emerald-holo-modal rounded-2xl overflow-hidden text-white relative shadow-2xl">
        {/* Holographic top border line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#63DCE8] to-transparent w-full" />

        {/* Modal Header */}
        <div className="p-5 pb-4 flex items-start justify-between border-b border-[#63DCE8]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#267A68] to-[#123B32] border border-[#63DCE8]/50 flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-[#63DCE8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#63DCE8] font-bold">
                  Clinical Attestation
                </span>
                <span className="text-white/40">·</span>
                <span className="text-xs text-white/70 font-mono">Stage 0{stage.id}</span>
              </div>
              <h3 className="text-lg font-bold font-display text-white">
                Execute KAVACHA Verification Gate
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Patient Context Block */}
          <div className="p-3 rounded-lg bg-black/30 border border-[#63DCE8]/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#86d5c0] block uppercase">Patient Identity</span>
              <span className="font-bold text-white text-sm">{patientName}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-[#86d5c0] block uppercase">Record Reference</span>
              <span className="font-mono text-white text-xs">{mrn}</span>
            </div>
          </div>

          {/* Gate Overview */}
          <div className="space-y-1">
            <div className="text-[#63DCE8] font-semibold text-xs flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Target Gate: {stage.name}</span>
            </div>
            <p className="text-white/70 text-[11px] leading-relaxed">
              By executing this digital stamp, you certify that all clinical pre-conditions, medication reconciliations,
              telemetry parameters, and escort requirements for Stage 0{stage.id} are verified.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-white/80 mb-1">
                Primary Clinician Signer & Credentials
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-[#63DCE8]/30 text-white placeholder-white/40 focus:outline-none focus:border-[#63DCE8] focus:ring-1 focus:ring-[#63DCE8]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-white/80 mb-1">
                  Receiving Witness RN
                </label>
                <input
                  type="text"
                  value={witnessName}
                  onChange={(e) => setWitnessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-[#63DCE8]/30 text-white placeholder-white/40 focus:outline-none focus:border-[#63DCE8] focus:ring-1 focus:ring-[#63DCE8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/80 mb-1">
                  Clinical PIN / Badge Auth
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    required
                    className="w-full px-3 py-2 pl-8 rounded-lg bg-white/10 border border-[#63DCE8]/30 text-white font-mono tracking-widest focus:outline-none focus:border-[#63DCE8] focus:ring-1 focus:ring-[#63DCE8]"
                  />
                  <Key className="w-3.5 h-3.5 text-[#63DCE8] absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Checkbox declaration */}
            <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded text-[#267A68] focus:ring-0 focus:ring-offset-0 bg-white/20 border-white/30"
              />
              <span className="text-[11px] text-white/80 leading-snug">
                I confirm physical bedside verification and warrant this transition meets all hospital safety standards.
              </span>
            </label>

            {/* Cryptographic Hash preview */}
            <div className="p-2 rounded bg-black/40 border border-white/10 text-[10px] font-mono text-white/60 flex items-center justify-between">
              <span>SECURITY CERTIFICATE:</span>
              <span className="text-[#63DCE8]">{shieldHash}</span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#63DCE8]/20 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSealing || !agreed}
              className="bg-gradient-to-r from-[#267A68] to-[#006971] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(99,220,232,0.4)] border border-[#63DCE8]/60 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSealing ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Stamping Audit Rail...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Execute Seal & Advance</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
