import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Activity, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  FileSpreadsheet, 
  Layers, 
  Building2, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../api/client';

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<{
    summary: {
      totalActiveTransitions: number;
      criticalAcuity: number;
      guardedAcuity: number;
      inTransit: number;
      dischargeReady: number;
      meanVelocityMinutes: number;
      medianVelocityMinutes: number;
      protocolAdherenceRate: number;
      totalAuditEvents: number;
    };
    blockerCategories: { category: string; count: number }[];
    unitVolumes: { unit: string; volume: number }[];
    stageDistribution: { stage: string; count: number }[];
  } | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCsv = () => {
    window.location.href = '/api/analytics/export-csv';
  };

  if (loading || !data) {
    return (
      <div className="emerald-glass-card rounded-xl p-12 text-center text-xs text-[#6f7975]">
        <div className="w-6 h-6 border-2 border-[#267A68] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Calculating operational transition analytics from database records...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="emerald-glass-card rounded-xl p-5 relative overflow-hidden">
        <div className="prism-line absolute top-0 left-0 right-0" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-b from-[#267A68] to-[#123B32] text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5 text-[#63DCE8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-[#111e1a]">
                  Operational Care Transition Analytics
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#FAF8F1] border border-[#DCE7E3] text-[#3f4945]">
                  Calculated from Real Database
                </span>
              </div>
              <p className="text-xs text-[#3f4945]">
                Aggregated clinical handoff velocity, stage bottleneck identification, and unit throughput.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAnalytics}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#DCE7E3] bg-white hover:bg-[#FAF8F1] text-[#3f4945] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="bg-gradient-to-b from-[#267A68] to-[#20594B] text-white px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm hover:brightness-105 active:scale-[0.98] border-t border-white/20 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#63DCE8]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Synthetic Notice */}
        <div className="mt-3 text-[11px] text-[#6f7975] flex items-center gap-1.5 font-mono">
          <span>* Notice: Computed from local persistent demonstration database encounters. Not for real clinical billing.</span>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="emerald-glass-card rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6f7975] font-bold">
            Total Transitions Monitored
          </span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#111e1a]">
              {data.summary.totalActiveTransitions}
            </span>
            <span className="text-xs text-[#006150] font-semibold">Active In Conduit</span>
          </div>
          <div className="text-[11px] text-[#3f4945]">
            Critical: <strong className="text-[#B42332]">{data.summary.criticalAcuity}</strong> · Guarded: <strong className="text-[#9A6500]">{data.summary.guardedAcuity}</strong>
          </div>
        </div>

        <div className="emerald-glass-card rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6f7975] font-bold">
            Mean Handoff Velocity
          </span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#006150]">
              {data.summary.meanVelocityMinutes}
            </span>
            <span className="text-xs text-[#3f4945]">min / transfer</span>
          </div>
          <div className="text-[11px] text-[#247A56]">
            Median duration: <strong>{data.summary.medianVelocityMinutes} min</strong>
          </div>
        </div>

        <div className="emerald-glass-card rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6f7975] font-bold">
            Protocol Invariant Adherence
          </span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#247A56]">
              {data.summary.protocolAdherenceRate}%
            </span>
            <span className="text-xs text-[#247A56] font-semibold">Verified Safe</span>
          </div>
          <div className="text-[11px] text-[#6f7975]">
            Zero un-reconciled gate bypasses
          </div>
        </div>

        <div className="emerald-glass-card rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6f7975] font-bold">
            Audit Trail Events Logged
          </span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#111e1a]">
              {data.summary.totalAuditEvents}
            </span>
            <span className="text-xs text-[#006971] font-semibold">Immutable Records</span>
          </div>
          <div className="text-[11px] text-[#6f7975]">
            Full chronological traceability
          </div>
        </div>
      </div>

      {/* Charts Grid: Blocker Categories & Stage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Blocker Categories Breakdown */}
        <div className="emerald-glass-card rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE7E3]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#B42332]" />
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-[#111e1a]">
                Most Frequent Transition Blockers
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#6f7975]">Safety Gates</span>
          </div>

          <div className="space-y-3">
            {data.blockerCategories.map((item, idx) => {
              const maxBlocker = Math.max(...data.blockerCategories.map(b => b.count), 1);
              const pct = Math.round((item.count / maxBlocker) * 100);
              return (
                <div key={idx} className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#111e1a]">{item.category}</span>
                    <span className="font-mono text-[#6f7975]">{item.count} flagged</span>
                  </div>
                  <div className="h-2 bg-[#FAF8F1] rounded-full overflow-hidden border border-[#DCE7E3]">
                    <div
                      className="h-full bg-gradient-to-r from-[#C6A15B] to-[#B42332] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage-wise Distribution */}
        <div className="emerald-glass-card rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE7E3]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#267A68]" />
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-[#111e1a]">
                Active Stage Pipeline Distribution
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#6f7975]">5-Stage Funnel</span>
          </div>

          <div className="space-y-3">
            {data.stageDistribution.map((item, idx) => {
              const maxCount = Math.max(...data.stageDistribution.map(s => s.count), 1);
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={idx} className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#111e1a]">{item.stage}</span>
                    <span className="font-mono text-[#006150] font-bold">{item.count} patients</span>
                  </div>
                  <div className="h-2 bg-[#FAF8F1] rounded-full overflow-hidden border border-[#DCE7E3]">
                    <div
                      className="h-full bg-[#267A68] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Unit Level Throughput Volumes */}
      <div className="emerald-glass-card rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE7E3]">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#006971]" />
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-[#111e1a]">
              Hospital Unit Source Volumes
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#6f7975]">Departmental Demand</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {data.unitVolumes.map((item, idx) => (
            <div key={idx} className="p-3 bg-white/80 rounded-lg border border-[#DCE7E3] text-center">
              <span className="text-[10px] font-bold uppercase text-[#6f7975] block truncate" title={item.unit}>
                {item.unit}
              </span>
              <span className="text-xl font-bold font-mono text-[#111e1a] mt-1 block">
                {item.volume}
              </span>
              <span className="text-[10px] text-[#006150] font-medium">Handoffs Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
