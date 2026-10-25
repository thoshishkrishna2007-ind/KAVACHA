import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  Lock,
  User,
  Download,
  Check
} from 'lucide-react';
import { api } from '../api/client';
import { AuditEvent } from '../types/backend';
import { generateAuditReportPDF } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';

export const AuditTrailView: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      generateAuditReportPDF(filteredEvents, { role: selectedRole, search: searchQuery }, currentUser);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Audit PDF generation failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const fetchAuditEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load audit events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditEvents();
  }, []);

  const filteredEvents = events.filter(e => {
    const matchesSearch =
      e.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.patientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'all' || e.actorRole === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="emerald-glass-card rounded-xl p-5 relative overflow-hidden">
        <div className="prism-line absolute top-0 left-0 right-0" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-b from-[#267A68] to-[#123B32] text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5 text-[#63DCE8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-[#111e1a]">
                  Append-Only Clinical Audit Trail
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#FAF8F1] border border-[#DCE7E3] text-[#3f4945]">
                  Cryptographic Integrity
                </span>
              </div>
              <p className="text-xs text-[#3f4945]">
                Tamper-resistant event ledger recording all clinical attestations, safety overrides, gate advancements, and role actions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading || filteredEvents.length === 0}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                downloadSuccess
                  ? 'bg-[#e8f7f1] border-[#247A56] text-[#247A56]'
                  : 'bg-white hover:bg-[#FAF8F1] border-[#DCE7E3] text-[#3f4945] hover:text-[#006150]'
              } disabled:opacity-50`}
              title="Download filtered audit trail as A4 vector PDF"
            >
              {isDownloading ? (
                <div className="w-3.5 h-3.5 border-2 border-[#006150] border-t-transparent rounded-full animate-spin" />
              ) : downloadSuccess ? (
                <Check className="w-3.5 h-3.5 text-[#247A56]" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#006971]" />
              )}
              <span>Download Audit PDF</span>
            </button>

            <button
              type="button"
              onClick={fetchAuditEvents}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#DCE7E3] bg-white hover:bg-[#FAF8F1] text-[#3f4945] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="emerald-glass-card rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6f7975] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by action, actor, patient name, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white/80 border border-[#DCE7E3] focus:outline-none focus:border-[#267A68] focus:ring-1 focus:ring-[#63DCE8]"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3] overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedRole('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedRole === 'all' ? 'bg-white text-[#006150] shadow-2xs font-bold' : 'text-[#6f7975]'
            }`}
          >
            All Roles ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('nurse')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedRole === 'nurse' ? 'bg-white text-[#006150] shadow-2xs font-bold' : 'text-[#6f7975]'
            }`}
          >
            Nurse
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('physician')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedRole === 'physician' ? 'bg-white text-[#006150] shadow-2xs font-bold' : 'text-[#6f7975]'
            }`}
          >
            Physician
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('pharmacist')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedRole === 'pharmacist' ? 'bg-white text-[#006150] shadow-2xs font-bold' : 'text-[#6f7975]'
            }`}
          >
            Pharmacist
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('transport')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedRole === 'transport' ? 'bg-white text-[#006150] shadow-2xs font-bold' : 'text-[#6f7975]'
            }`}
          >
            Transport
          </button>
        </div>
      </div>

      {/* Events Timeline List */}
      <div className="emerald-glass-card rounded-xl p-5">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#6f7975]">
            <div className="w-6 h-6 border-2 border-[#267A68] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading append-only audit trail records...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#6f7975]">
            No audit events found matching the search criteria.
          </div>
        ) : (
          <div className="divide-y divide-[#DCE7E3]">
            {filteredEvents.map((evt) => {
              const isSecurity = evt.action.includes('SECURITY') || evt.action.includes('DENIED');
              const isSeal = evt.action.includes('SEAL') || evt.action.includes('LOCKED');

              return (
                <div key={evt.id} className="py-3.5 first:pt-0 last:pb-0 text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isSecurity
                            ? 'bg-[#B42332]/10 text-[#B42332] border border-[#B42332]/30'
                            : isSeal
                            ? 'bg-[#e8f7f1] text-[#247A56] border border-[#247A56]/30'
                            : 'bg-[#e2f1eb] text-[#006150]'
                        }`}
                      >
                        {evt.action.replace(/_/g, ' ')}
                      </span>

                      <span className="font-bold text-[#111e1a]">
                        {evt.patientName}
                      </span>
                      <span className="text-[#bec9c4]">·</span>
                      <span className="text-[11px] font-mono text-[#6f7975]">
                        Entity: {evt.entityType}
                      </span>
                    </div>

                    <p className="text-xs text-[#3f4945] font-medium leading-relaxed">
                      {evt.details}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-[#6f7975] pt-0.5">
                      <User className="w-3 h-3 text-[#267A68]" />
                      <span>
                        Actor: <strong className="text-[#111e1a]">{evt.actorName}</strong> ({evt.actorRole.toUpperCase()})
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-[11px] text-[#6f7975] block">
                      {evt.timestamp}
                    </span>
                    <span className="text-[10px] font-mono text-[#bec9c4]">
                      ID: {evt.id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
