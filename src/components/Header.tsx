import React, { useState } from 'react';
import { 
  Shield, 
  Activity, 
  Plus, 
  FileText, 
  Clock, 
  Bell, 
  Sparkles, 
  BarChart3, 
  FileCheck, 
  Pill, 
  UserCheck, 
  RotateCcw,
  Layers
} from 'lucide-react';
import { CareTransition } from '../types/clinical';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/backend';

export type ActiveAppView = 'orchestration' | 'roster' | 'med_recon' | 'simulation' | 'analytics' | 'audit';

interface HeaderProps {
  activeView: ActiveAppView;
  setActiveView: (view: ActiveAppView) => void;
  onNewTransition: () => void;
  onOpenSbar: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  selectedPatient: CareTransition;
  patients: CareTransition[];
  onSelectPatient: (patient: CareTransition) => void;
  onResetDatabase: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onNewTransition,
  onOpenSbar,
  onOpenNotifications,
  unreadNotificationsCount,
  selectedPatient,
  patients,
  onSelectPatient,
  onResetDatabase,
}) => {
  const { currentUser, currentRole, switchRole, availableUsers } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const activeCount = patients.filter(p => p.stages.some(s => s.status === 'active')).length;
  const criticalCount = patients.filter(p => p.acuity === 'critical').length;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F1]/95 backdrop-blur-md border-b border-[#DCE7E3]">
      {/* Top Hairline Prism Refraction Line */}
      <div className="prism-line w-full" />

      <div className="max-w-[1780px] mx-auto px-4 lg:px-8 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Brand & System Status */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-b from-[#267A68] to-[#123B32] shadow-md border-t border-white/25">
              <Shield className="w-5 h-5 text-[#63DCE8]" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#63DCE8] optical-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold font-display text-[#111e1a] tracking-wider">
                  KAVACHA
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#DDF8F8] text-[#006150] border border-[#63DCE8]/40 tracking-wider">
                  CLINICAL PLATFORM
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono text-[#6f7975] bg-black/5 px-1.5 py-0.2 rounded">
                  Synthetic Demonstration
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#3f4945]">
                <span className="font-medium">Intelligent Clinical Care Transition & Patient Safety Platform</span>
                <span aria-hidden="true" className="text-[#bec9c4]">·</span>
                <span className="font-mono text-[#006150] font-semibold">
                  {activeCount} Active Handoffs ({criticalCount} Critical)
                </span>
              </div>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#e2f1eb]/80 border border-[#DCE7E3] rounded-lg overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveView('orchestration')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeView === 'orchestration'
                  ? 'bg-white text-[#006150] shadow-xs'
                  : 'text-[#3f4945] hover:text-[#111e1a]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#006150]" />
              <span>Orchestration</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('med_recon')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeView === 'med_recon'
                  ? 'bg-white text-[#006150] shadow-xs'
                  : 'text-[#3f4945] hover:text-[#111e1a]'
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-[#006971]" />
              <span>Med Recon & Science</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('roster')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeView === 'roster'
                  ? 'bg-white text-[#006150] shadow-xs'
                  : 'text-[#3f4945] hover:text-[#111e1a]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#006150]" />
              <span>Roster ({patients.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('simulation')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeView === 'simulation'
                  ? 'bg-white text-[#006150] shadow-xs'
                  : 'text-[#3f4945] hover:text-[#111e1a]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
              <span>Scenarios</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('analytics')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeView === 'analytics'
                  ? 'bg-white text-[#006150] shadow-xs'
                  : 'text-[#3f4945] hover:text-[#111e1a]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#006971]" />
              <span>Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('audit')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeView === 'audit'
                  ? 'bg-white text-[#006150] shadow-xs'
                  : 'text-[#3f4945] hover:text-[#111e1a]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#6f7975]" />
              <span>Audit Ledger</span>
            </button>
          </div>

          {/* User Role Switcher & Fast Actions */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* RBAC Demo Account Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="bg-white/80 hover:bg-[#DDF8F8] border border-[#63DCE8] px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold text-[#123B32] transition-colors cursor-pointer shadow-xs"
                title="Switch Demonstration Role"
              >
                <div className="w-2 h-2 rounded-full bg-[#247A56]" />
                <span className="font-mono text-[11px] text-[#006150] uppercase font-bold">
                  {currentRole.replace('_', ' ')}
                </span>
                <span className="text-[#6f7975] text-[11px] truncate max-w-[110px]">
                  {currentUser.name.split(',')[0]}
                </span>
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-[#DCE7E3] p-1.5 z-50 text-xs animate-fade-in">
                  <div className="px-2.5 py-1.5 font-bold text-[#6f7975] uppercase text-[10px] border-b border-[#DCE7E3] mb-1">
                    Select Demonstration Persona
                  </div>
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        switchRole(user.role);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex flex-col cursor-pointer ${
                        currentRole === user.role
                          ? 'bg-[#e8f7f1] text-[#006150] font-bold'
                          : 'hover:bg-[#FAF8F1] text-[#111e1a]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize font-semibold">{user.role.replace('_', ' ')}</span>
                        <span className="text-[10px] font-mono text-[#6f7975]">{user.badgeNumber}</span>
                      </div>
                      <span className="text-[11px] text-[#3f4945] font-normal truncate">
                        {user.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-1.5 rounded-lg border border-[#DCE7E3] bg-white/80 hover:bg-[#FAF8F1] text-[#3f4945] transition-colors cursor-pointer"
              title="Notification Center"
            >
              <Bell className="w-4 h-4 text-[#267A68]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B42332] text-white text-[9px] font-bold font-mono flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Quick SBAR */}
            <button
              type="button"
              onClick={onOpenSbar}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#DCE7E3] bg-white hover:bg-[#FAF8F1] text-[#3f4945] transition-colors cursor-pointer"
              title="View SBAR Handoff Brief"
            >
              <FileCheck className="w-3.5 h-3.5 text-[#006150]" />
              <span>SBAR</span>
            </button>

            {/* Initiate Transition */}
            <button
              type="button"
              onClick={onNewTransition}
              className="bg-gradient-to-b from-[#267A68] to-[#20594B] text-white px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-[0_2px_8px_rgba(38,122,104,0.35)] hover:brightness-105 active:scale-[0.98] border-t border-white/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Transition</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
