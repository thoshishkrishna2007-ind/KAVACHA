import React, { useState } from 'react';
import { 
  FileDown, 
  FileText, 
  FileCheck,
  ShieldCheck, 
  Printer, 
  Activity, 
  Pill, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  BarChart3, 
  Lock, 
  Search, 
  Filter, 
  Sparkles, 
  Check, 
  Eye, 
  Download, 
  RefreshCw,
  FolderDown,
  Layers,
  ChevronRight
} from 'lucide-react';
import { CareTransition } from '../types/clinical';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { 
  REPORT_CATALOG, 
  ReportCategory, 
  ReportMetadata,
  generateTransitionSummaryPDF,
  generatePatientOverviewPDF,
  generateClinicalReviewPDF,
  generateMedReconciliationPDF,
  generateSbarPDF,
  generateTransportPDF,
  generateReceivingPDF,
  generateAuditReportPDF,
  generateAnalyticsPDF
} from '../utils/pdfGenerator';
import { calculateReadiness } from '../utils/readiness';

interface ReportsCenterViewProps {
  patients: CareTransition[];
  selectedPatient: CareTransition;
  onSelectPatient: (patient: CareTransition) => void;
  onOpenSbar: (patient: CareTransition) => void;
}

export const ReportsCenterView: React.FC<ReportsCenterViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  onOpenSbar,
}) => {
  const { currentUser, currentRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'patient' | 'system'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [successReportId, setSuccessReportId] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<ReportMetadata | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const readiness = calculateReadiness(selectedPatient);

  const handleDownloadReport = async (reportId: ReportCategory) => {
    setDownloadingId(reportId);
    setErrorMessage(null);

    try {
      // Simulate micro-delay for realistic data compilation & validation
      await new Promise(r => setTimeout(r, 450));

      switch (reportId) {
        case 'transition-summary':
          generateTransitionSummaryPDF(selectedPatient, readiness, currentUser);
          break;
        case 'patient-overview':
          generatePatientOverviewPDF(selectedPatient, readiness, currentUser);
          break;
        case 'clinical-review':
          generateClinicalReviewPDF(selectedPatient, currentUser);
          break;
        case 'med-reconciliation':
          generateMedReconciliationPDF(selectedPatient, currentUser);
          break;
        case 'sbar-handoff':
          generateSbarPDF(selectedPatient, currentUser);
          break;
        case 'transport-readiness':
          generateTransportPDF(selectedPatient, currentUser);
          break;
        case 'receiving-confirmation':
          generateReceivingPDF(selectedPatient, currentUser);
          break;
        case 'audit-trail': {
          if (currentRole !== 'admin' && currentRole !== 'physician') {
            const proceed = window.confirm(
              `Notice: Regulatory Audit Ledger download is privileged to Quality Admins. Current role: ${currentRole.toUpperCase()}.\nProceed with synthetic demonstration download?`
            );
            if (!proceed) {
              setDownloadingId(null);
              return;
            }
          }
          const events = await api.getAuditEvents();
          generateAuditReportPDF(events, { role: 'all' }, currentUser);
          break;
        }
        case 'analytics-dashboard': {
          const analyticsData = await api.getAnalytics();
          generateAnalyticsPDF(analyticsData, currentUser);
          break;
        }
        default:
          throw new Error(`Report category ${reportId} not recognized.`);
      }

      setSuccessReportId(reportId);
      setTimeout(() => setSuccessReportId(null), 3000);
    } catch (err: any) {
      console.error('PDF Generation failed:', err);
      setErrorMessage(err.message || 'Failed to generate PDF document.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAllPatientReports = async () => {
    setDownloadingId('bundle');
    setErrorMessage(null);
    try {
      // Generate the 3 primary clinical handoff documents
      generateTransitionSummaryPDF(selectedPatient, readiness, currentUser);
      await new Promise(r => setTimeout(r, 600));
      generateMedReconciliationPDF(selectedPatient, currentUser);
      await new Promise(r => setTimeout(r, 600));
      generateSbarPDF(selectedPatient, currentUser);

      setSuccessReportId('bundle');
      setTimeout(() => setSuccessReportId(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Batch export failed.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredReports = REPORT_CATALOG.filter(rep => {
    const matchesSearch = 
      rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.discipline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.stageScope.toLowerCase().includes(searchQuery.toLowerCase());

    const isSystem = rep.id === 'audit-trail' || rep.id === 'analytics-dashboard';
    if (selectedFilter === 'patient' && isSystem) return false;
    if (selectedFilter === 'system' && !isSystem) return false;

    return matchesSearch;
  });

  const getReportIcon = (id: ReportCategory) => {
    switch (id) {
      case 'transition-summary':
        return <ShieldCheck className="w-5 h-5 text-[#006150]" />;
      case 'patient-overview':
        return <Activity className="w-5 h-5 text-[#006971]" />;
      case 'clinical-review':
        return <FileCheck className="w-5 h-5 text-[#267A68]" />;
      case 'med-reconciliation':
        return <Pill className="w-5 h-5 text-[#006971]" />;
      case 'sbar-handoff':
        return <FileText className="w-5 h-5 text-[#C6A15B]" />;
      case 'transport-readiness':
        return <Truck className="w-5 h-5 text-[#6d5011]" />;
      case 'receiving-confirmation':
        return <CheckCircle2 className="w-5 h-5 text-[#247A56]" />;
      case 'audit-trail':
        return <Lock className="w-5 h-5 text-[#6f7975]" />;
      case 'analytics-dashboard':
        return <BarChart3 className="w-5 h-5 text-[#006971]" />;
      default:
        return <FileText className="w-5 h-5 text-[#006150]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="emerald-glass-card rounded-xl p-5 relative overflow-hidden">
        <div className="prism-line absolute top-0 left-0 right-0" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#267A68] to-[#123B32] text-white flex items-center justify-center shadow-md border-t border-white/20">
              <FileDown className="w-6 h-6 text-[#63DCE8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display text-[#111e1a]">
                  Reports & Clinical Downloads Hub
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e2f1eb] text-[#006150] border border-[#267A68]/30">
                  A4 PRINT-READY PDF ENGINE
                </span>
              </div>
              <p className="text-xs text-[#3f4945] mt-0.5">
                Generate high-precision, ink-friendly vector PDF records for physical printing, EHR archival & Joint Commission regulatory compliance.
              </p>
            </div>
          </div>

          {/* Quick Batch Export Action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadAllPatientReports}
              disabled={downloadingId !== null}
              className="bg-gradient-to-b from-[#267A68] to-[#20594B] text-white px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-[0_4px_16px_rgba(38,122,104,0.35)] hover:brightness-105 active:scale-[0.98] border-t border-white/20 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {downloadingId === 'bundle' ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Clinical Bundle...</span>
                </>
              ) : successReportId === 'bundle' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#63DCE8]" />
                  <span>Patient Bundle Downloaded!</span>
                </>
              ) : (
                <>
                  <FolderDown className="w-3.5 h-3.5 text-[#63DCE8]" />
                  <span>Download Complete Patient Bundle</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Patient Context Selector Bar */}
        <div className="mt-4 pt-4 border-t border-[#DCE7E3] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#6f7975] uppercase text-[10px] tracking-wider">
              Active Patient Focus:
            </span>
            <select
              value={selectedPatient.id}
              onChange={(e) => {
                const found = patients.find(p => p.id === e.target.value);
                if (found) onSelectPatient(found);
              }}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#DCE7E3] font-bold text-[#111e1a] text-xs focus:outline-none focus:border-[#267A68] cursor-pointer shadow-2xs"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.patientName} ({p.mrn}) — Stage 0{p.currentStageId} ({p.sourceUnit} → {p.targetUnit})
                </option>
              ))}
            </select>
            <span className="text-[#6f7975] text-[11px] hidden sm:inline">
              Acuity: <strong className="text-[#006150] uppercase">{selectedPatient.acuity}</strong> · Protocol Score: <strong className="text-[#006150]">{readiness.overallScore}%</strong>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] text-[#6f7975]">Format:</span>
            <span className="font-mono font-bold text-[10px] bg-white px-2 py-0.5 rounded border border-[#DCE7E3] text-[#006150]">
              ISO 216 A4 (210 × 297 mm)
            </span>
            <span className="font-mono font-bold text-[10px] bg-white px-2 py-0.5 rounded border border-[#DCE7E3] text-[#C6A15B]">
              Botanical Emerald Palette
            </span>
          </div>
        </div>
      </div>

      {/* Error banner if generation fails */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-[#e2f1eb]/70 border border-[#DCE7E3] rounded-lg w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-white text-[#006150] shadow-2xs'
                : 'text-[#3f4945] hover:text-[#111e1a]'
            }`}
          >
            All Reports ({REPORT_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('patient')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedFilter === 'patient'
                ? 'bg-white text-[#006150] shadow-2xs'
                : 'text-[#3f4945] hover:text-[#111e1a]'
            }`}
          >
            Patient Clinical Reports (7)
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('system')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedFilter === 'system'
                ? 'bg-white text-[#006150] shadow-2xs'
                : 'text-[#3f4945] hover:text-[#111e1a]'
            }`}
          >
            System & Governance (2)
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#6f7975] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search report titles, scopes or roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#DCE7E3] focus:outline-none focus:border-[#267A68]"
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredReports.map((report) => {
          const isDownloading = downloadingId === report.id;
          const isSuccess = successReportId === report.id;
          const isSystemReport = report.id === 'audit-trail' || report.id === 'analytics-dashboard';

          return (
            <div
              key={report.id}
              className="emerald-glass-card rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all border border-[#DCE7E3] relative overflow-hidden group"
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#FAF8F1] border border-[#DCE7E3] group-hover:border-[#63DCE8]/60 transition-colors">
                      {getReportIcon(report.id)}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#006150] uppercase tracking-wider block">
                        {report.stageScope}
                      </span>
                      <h3 className="text-sm font-bold font-display text-[#111e1a] leading-tight">
                        {report.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Subtitle / Scope */}
                <p className="text-xs text-[#3f4945] line-clamp-2 leading-relaxed">
                  {report.subtitle}
                </p>

                {/* Clinical Context Tags */}
                <div className="pt-2 border-t border-[#DCE7E3]/70 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-[#6f7975]">
                    <span>Discipline Lead:</span>
                    <strong className="text-[#111e1a] font-medium">{report.discipline}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#6f7975]">
                    <span>Target Audience:</span>
                    <span className="text-[#111e1a] font-medium truncate max-w-[170px]" title={report.audience}>
                      {report.audience}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#6f7975]">
                    <span>Doc Geometry:</span>
                    <span className="font-mono font-semibold text-[#006150]">{report.estimatedPages} · A4</span>
                  </div>
                </div>

                {/* Patient status indicator if patient report */}
                {!isSystemReport && (
                  <div className="p-2 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3] text-[11px] flex items-center justify-between">
                    <span className="text-[#6f7975]">Subject:</span>
                    <span className="font-bold text-[#111e1a]">
                      {selectedPatient.patientName} ({selectedPatient.mrn})
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-[#DCE7E3] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadReport(report.id)}
                  disabled={isDownloading}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    isSuccess
                      ? 'bg-[#e8f7f1] text-[#247A56] border border-[#247A56]'
                      : 'bg-gradient-to-b from-[#267A68] to-[#20594B] text-white hover:brightness-105 active:scale-[0.98]'
                  } disabled:opacity-50`}
                >
                  {isDownloading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Vector PDF...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#247A56]" />
                      <span>Downloaded Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-[#63DCE8]" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewReport(report)}
                  className="p-2 rounded-lg border border-[#DCE7E3] bg-white hover:bg-[#FAF8F1] text-[#3f4945] transition-colors cursor-pointer"
                  title="View Report Specifications & Schema"
                >
                  <Eye className="w-3.5 h-3.5 text-[#006971]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Specifications Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#DCE7E3] space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#DCE7E3]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3]">
                  {getReportIcon(previewReport.id)}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#006150] uppercase tracking-wider block">
                    {previewReport.stageScope}
                  </span>
                  <h3 className="text-base font-bold font-display text-[#111e1a]">
                    {previewReport.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="text-[#6f7975] hover:text-[#111e1a] text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#3f4945]">
              {previewReport.subtitle}
            </p>

            <div className="space-y-2 text-xs bg-[#FAF8F1] p-3.5 rounded-xl border border-[#DCE7E3]">
              <div className="flex justify-between">
                <span className="text-[#6f7975]">Page Dimensions:</span>
                <span className="font-mono font-bold text-[#111e1a]">ISO 216 A4 (210 × 297 mm)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6f7975]">Typography & Font:</span>
                <span className="font-mono text-[#111e1a]">Helvetica / Helvetica Bold</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6f7975]">Palette Scheme:</span>
                <span className="text-[#006150] font-semibold">Botanical Emerald (#006150) & Champagne Gold</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6f7975]">Security Level:</span>
                <span className="text-[#B42332] font-semibold">Protected Health Information (PHI)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6f7975]">Audience:</span>
                <span className="text-[#111e1a]">{previewReport.audience}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#DCE7E3] hover:bg-[#FAF8F1] text-[#3f4945] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadReport(previewReport.id);
                  setPreviewReport(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-b from-[#267A68] to-[#20594B] text-white hover:brightness-105 cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#63DCE8]" />
                <span>Generate & Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
