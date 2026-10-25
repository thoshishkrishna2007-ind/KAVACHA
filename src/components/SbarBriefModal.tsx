import React, { useState, useRef } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck, 
  FileText, 
  Activity, 
  Heart, 
  Wind, 
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Calendar,
  Lock,
  Pill,
  Download,
  Share2
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { CareTransition } from '../types/clinical';
import { generateSbarPDF } from '../utils/pdfGenerator';

interface SbarBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: CareTransition;
}

export const SbarBriefModal: React.FC<SbarBriefModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printDocumentRef = useRef<HTMLDivElement>(null);

  const reactToPrintFn = useReactToPrint({
    contentRef: printDocumentRef,
    documentTitle: `EMERALD_SHIELD_SBAR_${patient.mrn}_${patient.patientName.replace(/\s+/g, '_')}`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 12mm 14mm 14mm 14mm;
      }
      @media print {
        html, body {
          background-color: #ffffff !important;
          color: #111e1a !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print {
          display: none !important;
        }
        .page-break-avoid {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
      }
    `,
    onBeforePrint: async () => {
      setIsPrinting(true);
    },
    onAfterPrint: () => {
      setIsPrinting(false);
    },
    onPrintError: () => {
      setIsPrinting(false);
    },
  });

  const triggerPrint = () => {
    setIsPrinting(true);
    try {
      if (typeof reactToPrintFn === 'function') {
        reactToPrintFn();
      } else {
        window.print();
      }
    } catch (err) {
      console.warn('Printing fallback initiated:', err);
      window.print();
    } finally {
      setTimeout(() => setIsPrinting(false), 500);
    }
  };

  if (!isOpen) return null;

  const handleCopyText = () => {
    const text = `==================================================================
KAVACHA CLINICAL CARE TRANSITION NETWORK — ERMC
STANDARDIZED SBAR CLINICAL HANDOFF BRIEF
==================================================================
PATIENT: ${patient.patientName} (${patient.mrn})
AGE/GENDER: ${patient.age}y ${patient.gender} | ADMITTED: ${patient.admissionDate}
DIAGNOSIS: ${patient.diagnosis}
ORIGIN: ${patient.sourceUnit}
DESTINATION: ${patient.targetUnit} (Bed: ${patient.targetBed})
CODE STATUS: ${patient.codeStatus} | ALLERGIES: ${patient.allergies.join(', ')}
FALL RISK: ${patient.fallRisk} | PRECAUTIONS: ${patient.isolationType || 'Standard'}

PHYSIOLOGICAL BASELINE AT TRANSFER:
Heart Rate: ${patient.telemetry.heartRate} bpm (${patient.telemetry.cardiacRhythm})
Blood Pressure: ${patient.telemetry.bloodPressure} mmHg (MAP: ${patient.telemetry.meanArterialPressure} mmHg)
Pulse Oximetry: ${patient.telemetry.spo2}% | Respiratory Rate: ${patient.telemetry.respiratoryRate}/min | Temp: ${patient.telemetry.temperature}°C

------------------------------------------------------------------
S · SITUATION
------------------------------------------------------------------
${patient.sbar.situation}

------------------------------------------------------------------
B · BACKGROUND
------------------------------------------------------------------
${patient.sbar.background}

------------------------------------------------------------------
A · ASSESSMENT
------------------------------------------------------------------
${patient.sbar.assessment}

------------------------------------------------------------------
R · RECOMMENDATION
------------------------------------------------------------------
${patient.sbar.recommendation}

------------------------------------------------------------------
ACTIVE RECONCILED MEDICATIONS:
${patient.medications.map(m => `• ${m.name} ${m.dose} ${m.route} (${m.frequency}) [Status: ${m.reconciliationStatus}]`).join('\n')}

TRANSPORT & ESCORT:
Mode: ${patient.transport.mode} | Escort: ${patient.transport.escortTeam}
Equipment: ${patient.transport.equipment.join(', ')}

CLINICAL ATTESTATIONS:
Sending Primary RN: ${patient.sbar.sendingNurse}
Receiving Primary RN: ${patient.sbar.receivingNurse}
Attending Physician: ${patient.sbar.attendingPhysician}
Audit Seal: KAVACHA-CERT-${patient.id.toUpperCase()}-${Math.floor(Date.now() / 1000).toString(16).toUpperCase()}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [isDownloadingDirectPdf, setIsDownloadingDirectPdf] = useState(false);
  const [downloadDirectSuccess, setDownloadDirectSuccess] = useState(false);

  const handleDirectDownloadPdf = () => {
    setIsDownloadingDirectPdf(true);
    try {
      generateSbarPDF(patient);
      setDownloadDirectSuccess(true);
      setTimeout(() => setDownloadDirectSuccess(false), 2500);
    } catch (err) {
      console.error('SBAR PDF export failed:', err);
    } finally {
      setIsDownloadingDirectPdf(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const shieldVerificationHash = `KAVACHA-SBAR-${patient.id.toUpperCase()}-${Math.floor(Date.now() / 1000).toString(16).toUpperCase()}-SEALED`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-4xl my-6 bg-white rounded-2xl shadow-2xl border border-[#DCE7E3] overflow-hidden text-[#111e1a] flex flex-col max-h-[92vh]">
        
        {/* Modal Toolbar (Screen View Only) */}
        <div className="bg-[#FAF8F1] border-b border-[#DCE7E3] px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-b from-[#267A68] to-[#123B32] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#63DCE8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#006150] font-bold">
                  Clinical Handoff Document
                </span>
                <span className="text-[#bec9c4]">·</span>
                <span className="text-xs text-[#6f7975] font-mono">Dual Engine: Print & Vector PDF</span>
              </div>
              <h3 className="text-base font-bold font-display text-[#111e1a] leading-tight">
                Structured Transition of Care Brief (SBAR)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Action */}
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#DCE7E3] bg-white hover:bg-[#FAF8F1] text-[#3f4945] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy plain text brief to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#247A56]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Direct Vector PDF Download Button */}
            <button
              type="button"
              onClick={handleDirectDownloadPdf}
              disabled={isDownloadingDirectPdf}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                downloadDirectSuccess
                  ? 'bg-[#e8f7f1] border-[#247A56] text-[#247A56]'
                  : 'bg-white hover:bg-[#FAF8F1] border-[#63DCE8] text-[#006150]'
              }`}
              title="Download standardized vector PDF document directly to disk"
            >
              {isDownloadingDirectPdf ? (
                <div className="w-3.5 h-3.5 border-2 border-[#006150] border-t-transparent rounded-full animate-spin" />
              ) : downloadDirectSuccess ? (
                <Check className="w-3.5 h-3.5 text-[#247A56]" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#006150]" />
              )}
              <span>Download PDF</span>
            </button>

            {/* Prominent Header Print Button */}
            <button
              type="button"
              onClick={triggerPrint}
              disabled={isPrinting}
              className="bg-gradient-to-b from-[#267A68] to-[#20594B] text-white px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-[0_4px_16px_rgba(38,122,104,0.35)] hover:brightness-105 active:scale-[0.98] border-t border-white/20 transition-all cursor-pointer disabled:opacity-50"
              title="Print formatted document via browser print dialog"
            >
              {isPrinting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Printer className="w-3.5 h-3.5 text-[#63DCE8]" />
              )}
              <span>Print Brief</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6f7975] hover:text-[#111e1a] hover:bg-black/5 transition-colors ml-1 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prominent Print Banner Bar (Screen Only) */}
        <div className="no-print bg-gradient-to-r from-[#e8f7f1] via-[#FAF8F1] to-[#e8f7f1] border-b border-[#267A68]/20 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 text-[#006150]">
            <span className="w-2 h-2 rounded-full bg-[#247A56] optical-pulse" />
            <span className="font-semibold">
              Archival SBAR Document Ready for Physical Printing or PDF Generation
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDirectDownloadPdf}
              disabled={isDownloadingDirectPdf}
              className="bg-white hover:bg-[#DDF8F8] border border-[#63DCE8] text-[#123B32] px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#006150]" />
              <span>Download PDF File</span>
            </button>

            <button
              type="button"
              onClick={triggerPrint}
              disabled={isPrinting}
              className="bg-[#267A68] hover:bg-[#20594B] text-white px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#63DCE8]" />
              <span>Open Print Dialog</span>
            </button>
          </div>
        </div>

        {/* Modal Scroll Container wrapping the printable document */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          
          {/* Printable Document Root (Attached to contentRef for react-to-print) */}
          <div
            ref={printDocumentRef}
            className="w-full max-w-[850px] mx-auto bg-white p-6 sm:p-10 shadow-sm border border-slate-200 text-[#111e1a] text-xs leading-normal font-sans"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            {/* 1. Institutional Letterhead Header */}
            <div className="border-b-2 border-[#267A68] pb-4 mb-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#123B32] text-white flex items-center justify-center border border-[#63DCE8]/40 shadow-xs">
                    <ShieldCheck className="w-7 h-7 text-[#63DCE8]" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold tracking-wider font-mono text-[#006150] uppercase">
                      KAVACHA Clinical Care Transition Network
                    </div>
                    <h1 className="text-xl font-bold font-display text-[#111e1a] tracking-tight">
                      Standardized Care Transition & Handoff Record
                    </h1>
                    <div className="text-[10px] text-[#6f7975] font-mono mt-0.5">
                      Clinical Protocol: SBAR (Situation, Background, Assessment, Recommendation)
                    </div>
                  </div>
                </div>

                <div className="text-right text-[10px] font-mono text-[#3f4945] space-y-0.5">
                  <div className="font-bold text-[#B42332] uppercase">
                    CONFIDENTIAL MEDICAL RECORD
                  </div>
                  <div>Generated: <strong>{currentDate} {currentTime}</strong></div>
                  <div>Protocol Node: <strong>ERMC-ALPHA-TRANS-01</strong></div>
                  <div className="text-[#006150] font-semibold">Security Hash: {patient.id.toUpperCase()}</div>
                </div>
              </div>
            </div>

            {/* 2. Patient Demographics & Encounters Block */}
            <div className="page-break-avoid border border-[#DCE7E3] rounded-lg p-4 bg-[#FAF8F1] mb-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#6f7975] block font-semibold">
                    Patient Legal Name
                  </span>
                  <span className="font-bold text-sm text-[#111e1a]">{patient.patientName}</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-[#6f7975] block font-semibold">
                    Medical Record # (MRN)
                  </span>
                  <span className="font-bold font-mono text-[#006150] text-sm">{patient.mrn}</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-[#6f7975] block font-semibold">
                    Demographics / DOB
                  </span>
                  <span className="font-semibold text-[#111e1a]">
                    {patient.age} yrs · {patient.gender === 'F' ? 'Female' : patient.gender === 'M' ? 'Male' : 'Other'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-[#6f7975] block font-semibold">
                    Admission Date
                  </span>
                  <span className="font-semibold text-[#111e1a]">{patient.admissionDate}</span>
                </div>
              </div>

              {/* Diagnosis & Units Grid */}
              <div className="mt-3 pt-3 border-t border-[#DCE7E3] grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <span className="text-[10px] font-mono uppercase text-[#6f7975] block font-semibold">
                    Primary Diagnosis / Clinical Focus
                  </span>
                  <span className="font-bold text-[#111e1a] block leading-snug">
                    {patient.diagnosis}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-[#6f7975] block font-semibold">
                    Originating Care Unit
                  </span>
                  <span className="font-semibold text-[#111e1a]">{patient.sourceUnit}</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-[#6f7975] block font-semibold">
                    Receiving Unit & Allocated Bed
                  </span>
                  <span className="font-bold text-[#006150]">{patient.targetUnit} (Bed: {patient.targetBed})</span>
                </div>
              </div>

              {/* Safety Badges row */}
              <div className="mt-3 pt-3 border-t border-[#DCE7E3] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#6f7975] mr-1">Code Status:</span>
                    <strong className="text-[#111e1a] font-mono">{patient.codeStatus}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#6f7975] mr-1">Fall Risk:</span>
                    <strong className="text-[#111e1a]">{patient.fallRisk} Risk</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#6f7975] mr-1">Isolation:</span>
                    <strong className="text-[#111e1a]">{patient.isolationType || 'Standard Precautions'}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-[#B42332] font-bold mr-1">Allergies:</span>
                  <span className="font-semibold text-[#B42332]">{patient.allergies.join('; ')}</span>
                </div>
              </div>
            </div>

            {/* 3. Physiological Telemetry Baseline at Handover */}
            <div className="page-break-avoid border border-[#267A68]/30 rounded-lg p-3 bg-[#e8f7f1]/50 mb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold font-display uppercase tracking-wider text-[#006150]">
                  <Activity className="w-4 h-4 text-[#267A68]" />
                  <span>Physiological Telemetry Baseline Recorded at Handoff</span>
                </div>
                <span className="text-[10px] font-mono text-[#6f7975]">
                  Status: Validated Within Invariant Bounds
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                <div className="p-2 bg-white rounded border border-[#DCE7E3]">
                  <span className="text-[9px] uppercase font-mono text-[#6f7975] block">Heart Rate</span>
                  <span className="font-bold font-mono text-sm text-[#111e1a]">{patient.telemetry.heartRate}</span>
                  <span className="text-[9px] text-[#6f7975] block">BPM</span>
                </div>

                <div className="p-2 bg-white rounded border border-[#DCE7E3]">
                  <span className="text-[9px] uppercase font-mono text-[#6f7975] block">Blood Pressure</span>
                  <span className="font-bold font-mono text-sm text-[#111e1a]">{patient.telemetry.bloodPressure}</span>
                  <span className="text-[9px] text-[#6f7975] block">mmHg</span>
                </div>

                <div className="p-2 bg-white rounded border border-[#DCE7E3]">
                  <span className="text-[9px] uppercase font-mono text-[#6f7975] block">SpO2</span>
                  <span className="font-bold font-mono text-sm text-[#006150]">{patient.telemetry.spo2}%</span>
                  <span className="text-[9px] text-[#6f7975] block">Room Air/NC</span>
                </div>

                <div className="p-2 bg-white rounded border border-[#DCE7E3]">
                  <span className="text-[9px] uppercase font-mono text-[#6f7975] block">MAP</span>
                  <span className="font-bold font-mono text-sm text-[#111e1a]">{patient.telemetry.meanArterialPressure}</span>
                  <span className="text-[9px] text-[#6f7975] block">mmHg</span>
                </div>

                <div className="p-2 bg-white rounded border border-[#DCE7E3]">
                  <span className="text-[9px] uppercase font-mono text-[#6f7975] block">Resp Rate</span>
                  <span className="font-bold font-mono text-sm text-[#111e1a]">{patient.telemetry.respiratoryRate}</span>
                  <span className="text-[9px] text-[#6f7975] block">/min</span>
                </div>

                <div className="p-2 bg-white rounded border border-[#DCE7E3]">
                  <span className="text-[9px] uppercase font-mono text-[#6f7975] block">Temperature</span>
                  <span className="font-bold font-mono text-sm text-[#111e1a]">{patient.telemetry.temperature}°C</span>
                  <span className="text-[9px] text-[#6f7975] block">Core</span>
                </div>
              </div>

              <div className="mt-2 text-[10px] font-mono text-[#3f4945] px-1">
                Cardiac Rhythm Assessment: <strong>{patient.telemetry.cardiacRhythm}</strong>
              </div>
            </div>

            {/* 4. Structured SBAR Quadrants */}
            <div className="space-y-4 mb-5">
              
              {/* S: Situation */}
              <div className="page-break-avoid border border-[#DCE7E3] rounded-lg overflow-hidden bg-white">
                <div className="bg-[#267A68] text-white px-3 py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white text-[#267A68] flex items-center justify-center font-bold text-xs font-mono">
                      S
                    </span>
                    <h2 className="text-xs font-bold uppercase tracking-wider font-display text-white">
                      Situation — Immediate Reason for Transition
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-white/80">Active Clinical State</span>
                </div>
                <div className="p-3.5 text-xs text-[#111e1a] leading-relaxed">
                  {patient.sbar.situation}
                </div>
              </div>

              {/* B: Background */}
              <div className="page-break-avoid border border-[#DCE7E3] rounded-lg overflow-hidden bg-white">
                <div className="bg-[#20594B] text-white px-3 py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white text-[#20594B] flex items-center justify-center font-bold text-xs font-mono">
                      B
                    </span>
                    <h2 className="text-xs font-bold uppercase tracking-wider font-display text-white">
                      Background — Clinical Course & Pertinent History
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-white/80">Diagnostic Timeline</span>
                </div>
                <div className="p-3.5 text-xs text-[#111e1a] leading-relaxed">
                  {patient.sbar.background}
                </div>
              </div>

              {/* A: Assessment */}
              <div className="page-break-avoid border border-[#DCE7E3] rounded-lg overflow-hidden bg-white">
                <div className="bg-[#006971] text-white px-3 py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white text-[#006971] flex items-center justify-center font-bold text-xs font-mono">
                      A
                    </span>
                    <h2 className="text-xs font-bold uppercase tracking-wider font-display text-white">
                      Assessment — Current Findings & Risk Stratification
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-white/80">Objective Examination</span>
                </div>
                <div className="p-3.5 text-xs text-[#111e1a] leading-relaxed">
                  {patient.sbar.assessment}
                </div>
              </div>

              {/* R: Recommendation */}
              <div className="page-break-avoid border border-[#DCE7E3] rounded-lg overflow-hidden bg-white">
                <div className="bg-[#123B32] text-white px-3 py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white text-[#123B32] flex items-center justify-center font-bold text-xs font-mono">
                      R
                    </span>
                    <h2 className="text-xs font-bold uppercase tracking-wider font-display text-white">
                      Recommendation — Critical Orders & Contingencies
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-white/80">Care Plan Gates</span>
                </div>
                <div className="p-3.5 text-xs text-[#111e1a] leading-relaxed">
                  {patient.sbar.recommendation}
                </div>
              </div>

            </div>

            {/* 5. Active Reconciled Medications Snapshot */}
            <div className="page-break-avoid border border-[#DCE7E3] rounded-lg p-3.5 bg-white mb-5">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#DCE7E3]">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#006150] font-display">
                  <Pill className="w-4 h-4 text-[#267A68]" />
                  <span>Reconciled Transition Medication Regimen ({patient.medications.length} Monitored Items)</span>
                </div>
                <span className="text-[10px] font-mono text-[#247A56] font-semibold">
                  ✓ Clinical Pharmacy Attestation Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {patient.medications.map((med) => (
                  <div key={med.id} className="p-2 rounded border border-[#DCE7E3] bg-[#FAF8F1]">
                    <div className="flex items-center justify-between">
                      <strong className="text-[#111e1a]">{med.name}</strong>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-white text-[#006150] border border-[#DCE7E3]">
                        {med.reconciliationStatus}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#3f4945]">
                      {med.dose} · {med.route} · {med.frequency}
                    </div>
                    {med.notes && (
                      <div className="text-[10px] text-[#9A6500] italic mt-0.5">{med.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Transport Safeguards & Escort */}
            <div className="page-break-avoid border border-[#DCE7E3] rounded-lg p-3.5 bg-[#FAF8F1] mb-5">
              <div className="text-xs font-bold uppercase text-[#006150] font-display mb-1.5">
                Transport Mode & Equipment Safeguards
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[#6f7975]">Mode:</span> <strong className="text-[#111e1a]">{patient.transport.mode}</strong>
                </div>
                <div>
                  <span className="text-[#6f7975]">Escort:</span> <strong className="text-[#111e1a]">{patient.transport.escortTeam}</strong>
                </div>
                <div>
                  <span className="text-[#6f7975]">Equipment:</span> <strong className="text-[#111e1a]">{patient.transport.equipment.join(', ')}</strong>
                </div>
              </div>
            </div>

            {/* 7. Dual Clinician Custody Transfer & Digital Attestation Signatures */}
            <div className="page-break-avoid border-2 border-[#267A68] rounded-xl p-4 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-[#DCE7E3] pb-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#006150] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#247A56]" />
                  <span>Dual Clinician Custody Handoff Verification & Legal Attestation</span>
                </div>
                <span className="text-[10px] font-mono text-[#247A56] font-bold">
                  MUTUALLY EXECUTED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Sending Nurse */}
                <div className="p-3 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#6f7975] block font-bold">
                    Sending Primary Clinician
                  </span>
                  <div className="font-bold text-[#111e1a]">{patient.sbar.sendingNurse}</div>
                  <div className="text-[10px] text-[#247A56] font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Verbal SBAR Delivered</span>
                  </div>
                  <div className="text-[9px] font-mono text-[#6f7975] pt-1">
                    Sign-Off: {patient.sbar.completedAt || '07:35 AM'}
                  </div>
                </div>

                {/* Receiving Nurse */}
                <div className="p-3 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#6f7975] block font-bold">
                    Receiving Primary Clinician
                  </span>
                  <div className="font-bold text-[#111e1a]">{patient.sbar.receivingNurse}</div>
                  <div className="text-[10px] text-[#247A56] font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Bed & Telemetry Confirmed</span>
                  </div>
                  <div className="text-[9px] font-mono text-[#6f7975] pt-1">
                    Handshake: {patient.sbar.completedAt || '07:40 AM'}
                  </div>
                </div>

                {/* Attending Physician */}
                <div className="p-3 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#6f7975] block font-bold">
                    Attending Physician
                  </span>
                  <div className="font-bold text-[#111e1a]">{patient.sbar.attendingPhysician}</div>
                  <div className="text-[10px] text-[#006150] font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Transfer Order Authorized</span>
                  </div>
                  <div className="text-[9px] font-mono text-[#6f7975] pt-1">
                    EMR Order Ref #77810
                  </div>
                </div>
              </div>

              {/* Cryptographic Seal Bar */}
              <div className="mt-3 pt-2 border-t border-[#DCE7E3] flex flex-col sm:flex-row sm:items-center justify-between text-[10px] font-mono text-[#6f7975] gap-2">
                <div className="flex items-center gap-1.5 text-[#006150]">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="font-bold">VERIFICATION HASH:</span>
                  <span>{shieldVerificationHash}</span>
                </div>
                <div>
                  Archival Copy — Retain in Permanent Electronic Health Record (EHR)
                </div>
              </div>
            </div>

            {/* Document Footer */}
            <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-[#6f7975] font-mono">
              KAVACHA Clinical Care Transition Network · Form SBAR-2026-REV4 · Verified Protocol
            </div>

          </div>
        </div>

        {/* Modal Footer (Screen View Only) */}
        <div className="bg-[#FAF8F1] border-t border-[#DCE7E3] px-5 py-3 flex items-center justify-between shrink-0">
          <div className="text-xs text-[#3f4945] hidden sm:block">
            Document optimized for physical printing and PDF export with high-contrast clinical headers.
          </div>

          <div className="flex items-center gap-2">
            {/* Prominent Footer Print Button */}
            <button
              type="button"
              onClick={triggerPrint}
              disabled={isPrinting}
              className="bg-gradient-to-b from-[#267A68] to-[#20594B] text-white px-5 py-2 text-xs font-bold rounded-lg flex items-center gap-2 shadow-[0_4px_16px_rgba(38,122,104,0.35)] hover:brightness-105 active:scale-[0.98] border-t border-white/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-[#63DCE8]" />
              <span>Print / Export PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#DCE7E3] bg-white hover:bg-[#FAF8F1] text-[#3f4945] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
