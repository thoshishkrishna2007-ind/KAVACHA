import React, { useState, useEffect, useCallback } from 'react';
import { CareTransition, ChecklistItem } from './types/clinical';
import { api } from './api/client';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header, ActiveAppView } from './components/Header';
import { PatientSidebar } from './components/PatientSidebar';
import { TransitionConduit } from './components/TransitionConduit';
import { StageOrchestrationPanel } from './components/StageOrchestrationPanel';
import { ReadinessEnginePanel } from './components/ReadinessEnginePanel';
import { VerificationModal } from './components/VerificationModal';
import { SbarBriefModal } from './components/SbarBriefModal';
import { NewTransitionModal } from './components/NewTransitionModal';
import { RosterOverview } from './components/RosterOverview';
import { SimulationCenter } from './components/SimulationCenter';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AuditTrailView } from './components/AuditTrailView';
import { NotificationCenter } from './components/NotificationCenter';
import { MedicationReconciliationView } from './components/MedicationReconciliationView';
import { CinematicIntro } from './components/CinematicIntro';
import { FeaturesGuideView } from './components/FeaturesGuideView';
import { ReportsCenterView } from './components/ReportsCenterView';
import { calculateReadiness } from './utils/readiness';
import { ReadinessBreakdown } from './types/backend';
import { INITIAL_PATIENTS } from './data/mockPatients';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

function AppContent() {
  const { currentRole } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [patients, setPatients] = useState<CareTransition[]>(INITIAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('tr-0941');
  const [selectedStageId, setSelectedStageId] = useState<number>(3);
  const [activeView, setActiveView] = useState<ActiveAppView>('orchestration');

  // Modals state
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isSbarModalOpen, setIsSbarModalOpen] = useState(false);
  const [isNewTransitionModalOpen, setIsNewTransitionModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [patientForSbar, setPatientForSbar] = useState<CareTransition | null>(null);

  // Status & Notifications count
  const [unreadCount, setUnreadCount] = useState<number>(2);
  const [isSimulatingTelemetry, setIsSimulatingTelemetry] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warn' | 'error' } | null>(null);
  const [serverErrorBanner, setServerErrorBanner] = useState<string | null>(null);

  const showToast = (text: string, type: 'success' | 'warn' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load patients from backend
  const loadPatients = useCallback(async () => {
    try {
      const data = await api.getPatients();
      if (data && data.length > 0) {
        setPatients(data);
      }
      const notifs = await api.getNotifications();
      setUnreadCount(notifs.filter(n => !n.read).length);
      setServerErrorBanner(null);
    } catch (err: any) {
      console.warn('Backend API connection note:', err.message);
      // Fallback to local memory state if offline
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients, currentRole]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const readiness = calculateReadiness(selectedPatient);

  // When patient selection changes
  const handleSelectPatient = (patient: CareTransition) => {
    setSelectedPatientId(patient.id);
    setSelectedStageId(patient.currentStageId);
    setActiveView('orchestration');
    showToast(`Focused on patient ${patient.patientName} (${patient.mrn})`);
  };

  // Checklist toggle with backend sync
  const handleToggleChecklist = async (stageId: number, checkId: string) => {
    try {
      const res = await api.toggleChecklist(selectedPatient.id, stageId, checkId);
      setPatients(prev => prev.map(p => p.id === res.patient.id ? res.patient : p));
      showToast('Checklist criteria recorded to audit ledger.');
    } catch (err: any) {
      // Local optimistic fallback
      setPatients(prev => prev.map(p => {
        if (p.id !== selectedPatient.id) return p;
        const updatedStages = p.stages.map(s => {
          if (s.id !== stageId) return s;
          return {
            ...s,
            checklists: s.checklists.map(c => c.id === checkId ? { ...c, completed: !c.completed } : c),
          };
        });
        return { ...p, stages: updatedStages };
      }));
      showToast(err.message, 'warn');
    }
  };

  // Add custom checklist item
  const handleAddChecklistItem = (
    stageId: number,
    label: string,
    discipline: ChecklistItem['discipline']
  ) => {
    setPatients(prev => prev.map(patient => {
      if (patient.id !== selectedPatient.id) return patient;
      const updatedStages = patient.stages.map(stage => {
        if (stage.id !== stageId) return stage;
        return {
          ...stage,
          checklists: [
            ...stage.checklists,
            {
              id: `c-cust-${Date.now()}`,
              label,
              discipline,
              completed: false,
              requiredForAdvance: false,
            },
          ],
        };
      });
      return { ...patient, stages: updatedStages };
    }));
    showToast(`Custom protocol item added for ${discipline}`);
  };

  // Advance stage with server-enforced validation
  const handleAdvanceStage = async () => {
    try {
      const res = await api.advanceStage(selectedPatient.id);
      setPatients(prev => prev.map(p => p.id === res.patient.id ? res.patient : p));
      setSelectedStageId(res.patient.currentStageId);
      showToast(`Stage 0${res.patient.currentStageId} successfully advanced & sealed!`);
      setServerErrorBanner(null);
    } catch (err: any) {
      setServerErrorBanner(err.message);
      showToast('Stage advance blocked: see safety details below.', 'error');
    }
  };

  // Confirm verification modal
  const handleConfirmVerification = async (signerName: string, witnessName: string, pin: string) => {
    try {
      const res = await api.advanceStage(selectedPatient.id);
      setPatients(prev => prev.map(p => p.id === res.patient.id ? res.patient : p));
      setSelectedStageId(res.patient.currentStageId);
      showToast(`KAVACHA Verification Gate sealed by ${signerName}`);
    } catch (err: any) {
      setServerErrorBanner(err.message);
      showToast(err.message, 'error');
    }
  };

  // Medication status update
  const handleToggleMedicationStatus = async (medId: string) => {
    const med = selectedPatient.medications.find(m => m.id === medId);
    if (!med) return;
    try {
      const nextStatus = med.reconciliationStatus === 'verified' ? 'adjusted' : 'verified';
      const updated = await api.updateMedication(selectedPatient.id, medId, nextStatus);
      setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
      showToast(`Medication ${med.name} updated to ${nextStatus}.`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Audit note
  const handleUpdateAuditNote = (note: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id !== selectedPatient.id) return p;
      return {
        ...p,
        lastAuditNote: `${note} — logged by ${currentRole.toUpperCase()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      };
    }));
    showToast('Clinical coordinator note logged.');
  };

  // Add new patient
  const handleAddNewPatient = async (newPatient: CareTransition) => {
    try {
      const created = await api.createPatient(newPatient);
      setPatients(prev => [created, ...prev]);
      setSelectedPatientId(created.id);
      setSelectedStageId(1);
      setActiveView('orchestration');
      showToast(`New care transition initialized for ${created.patientName}`);
    } catch (err: any) {
      setPatients(prev => [newPatient, ...prev]);
      setSelectedPatientId(newPatient.id);
      setSelectedStageId(1);
      setActiveView('orchestration');
      showToast(`New care transition created: ${newPatient.patientName}`);
    }
  };

  // Simulate Telemetry
  const handleSimulateTelemetry = () => {
    setIsSimulatingTelemetry(true);
    setTimeout(() => {
      setPatients(prev => prev.map(p => {
        if (p.id !== selectedPatient.id) return p;
        const hrDelta = Math.floor(Math.random() * 5) - 2;
        const newHR = Math.max(55, Math.min(125, p.telemetry.heartRate + hrDelta));
        const newSpo2 = Math.min(100, Math.max(93, p.telemetry.spo2 + (Math.random() > 0.5 ? 1 : -1)));
        return {
          ...p,
          telemetry: {
            ...p.telemetry,
            heartRate: newHR,
            spo2: newSpo2,
            lastUpdated: 'Just now',
          },
        };
      }));
      setIsSimulatingTelemetry(false);
      showToast('Bedside wireless telemetry sample refreshed.');
    }, 350);
  };

  const currentStageForModal =
    selectedPatient.stages.find(s => s.id === selectedStageId) || selectedPatient.stages[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F1] text-[#111e1a]">
      {/* Cinematic Opening Animation (Plays once on full page refresh) */}
      {showIntro && <CinematicIntro onComplete={() => setShowIntro(false)} />}

      {/* Top Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onNewTransition={() => setIsNewTransitionModalOpen(true)}
        onOpenSbar={() => {
          setPatientForSbar(selectedPatient);
          setIsSbarModalOpen(true);
        }}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={unreadCount}
        selectedPatient={selectedPatient}
        patients={patients}
        onSelectPatient={handleSelectPatient}
        onResetDatabase={() => {
          api.resetDemoDatabase().then(() => loadPatients());
          showToast('Demonstration database reset to seed baseline.');
        }}
      />

      {/* Safety Gate Alert Banner if blocked */}
      {serverErrorBanner && (
        <div className="bg-[#B42332]/10 border-b border-[#B42332]/30 px-4 py-2.5 text-xs text-[#B42332] flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-[1720px] mx-auto w-full">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{serverErrorBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setServerErrorBanner(null)}
            className="p-1 text-[#B42332] hover:text-[#93000a]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1780px] w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* VIEW 1: Main Transition Orchestration Canvas */}
        {activeView === 'orchestration' && (
          <div>
            {/* Explainable Transition Readiness Engine */}
            <ReadinessEnginePanel
              readiness={readiness}
              patient={selectedPatient}
            />

            {/* Stepped Transition Pathway Conduit */}
            <TransitionConduit
              stages={selectedPatient.stages}
              activeStageId={selectedStageId}
              onSelectStage={(id) => setSelectedStageId(id)}
              patientName={selectedPatient.patientName}
              sourceUnit={selectedPatient.sourceUnit}
              targetUnit={selectedPatient.targetUnit}
              shieldScore={readiness.overallScore}
            />

            {/* 12-Column Responsive Layout: Fixed 320px Sidebar + Fluid Stage Panel */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <PatientSidebar
                patient={selectedPatient}
                onOpenVerificationModal={() => setIsVerificationModalOpen(true)}
                onOpenSbarModal={() => {
                  setPatientForSbar(selectedPatient);
                  setIsSbarModalOpen(true);
                }}
                onSimulateTelemetry={handleSimulateTelemetry}
                isSimulatingTelemetry={isSimulatingTelemetry}
              />

              <div className="flex-1 w-full min-w-0">
                <StageOrchestrationPanel
                  patient={selectedPatient}
                  activeStageId={selectedStageId}
                  onToggleChecklist={handleToggleChecklist}
                  onAddChecklistItem={handleAddChecklistItem}
                  onAdvanceStage={handleAdvanceStage}
                  onOpenVerificationModal={() => setIsVerificationModalOpen(true)}
                  onToggleMedicationStatus={handleToggleMedicationStatus}
                  onUpdateAuditNote={handleUpdateAuditNote}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Medication Reconciliation & Bioscience Science Engine */}
        {activeView === 'med_recon' && (
          <MedicationReconciliationView
            patient={selectedPatient}
            onMedicationUpdated={(updated) => {
              setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
              showToast('Medication reconciliation synchronized.');
            }}
          />
        )}

        {/* VIEW 3: Hospital-Wide Roster & Dispatch Matrix */}
        {activeView === 'roster' && (
          <RosterOverview
            patients={patients}
            onSelectPatient={handleSelectPatient}
            onOpenSbar={(p) => {
              setPatientForSbar(p);
              setIsSbarModalOpen(true);
            }}
          />
        )}

        {/* VIEW 4: Central Reports & PDF Downloads Hub */}
        {activeView === 'reports' && (
          <ReportsCenterView
            patients={patients}
            selectedPatient={selectedPatient}
            onSelectPatient={handleSelectPatient}
            onOpenSbar={(p) => {
              setPatientForSbar(p);
              setIsSbarModalOpen(true);
            }}
          />
        )}

        {/* VIEW 5: Clinical Safety Simulation Center */}
        {activeView === 'simulation' && (
          <SimulationCenter
            onScenarioExecuted={(scenarioName) => {
              loadPatients();
              showToast(`Scenario executed: ${scenarioName}`);
            }}
          />
        )}

        {/* VIEW 5: Operational Analytics Dashboard */}
        {activeView === 'analytics' && (
          <AnalyticsDashboard />
        )}

        {/* VIEW 6: Append-Only Audit Trail Ledger */}
        {activeView === 'audit' && (
          <AuditTrailView />
        )}

        {/* VIEW 7: Comprehensive All Features & System Guide */}
        {activeView === 'guide' && (
          <FeaturesGuideView
            onNavigateToView={(view) => setActiveView(view)}
            onOpenSbar={() => {
              setPatientForSbar(selectedPatient);
              setIsSbarModalOpen(true);
            }}
            onOpenNewTransition={() => setIsNewTransitionModalOpen(true)}
          />
        )}

      </main>

      {/* Footer Branding */}
      <footer className="mt-auto border-t border-[#DCE7E3] bg-[#FAF8F1] py-3.5 text-center text-xs text-[#6f7975]">
        <div className="max-w-[1780px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-bold text-[#111e1a] tracking-wider font-display">
            KAVACHA · Intelligent Clinical Care Transition & Patient Safety Platform
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveView('guide')}
              className="font-semibold text-[#006150] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Platform Capabilities & Architecture Guide</span>
            </button>
            <span aria-hidden="true" className="text-[#bec9c4]">·</span>
            <span className="font-mono text-[11px] text-[#006150]">
              System Node Alpha · Synthetic Demonstration Protocol
            </span>
          </div>
        </div>
      </footer>

      {/* Holographic Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        stage={currentStageForModal}
        patientName={selectedPatient.patientName}
        mrn={selectedPatient.mrn}
        onConfirmVerification={handleConfirmVerification}
      />

      {/* SBAR Brief Document Modal */}
      {patientForSbar && (
        <SbarBriefModal
          isOpen={isSbarModalOpen}
          onClose={() => {
            setIsSbarModalOpen(false);
            setPatientForSbar(null);
          }}
          patient={patientForSbar}
        />
      )}

      {/* New Transition Modal */}
      <NewTransitionModal
        isOpen={isNewTransitionModalOpen}
        onClose={() => setIsNewTransitionModalOpen(false)}
        onAddPatient={handleAddNewPatient}
      />

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectPatientById={(id) => {
          const found = patients.find(p => p.id === id);
          if (found) handleSelectPatient(found);
        }}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium animate-fade-in text-white border ${
            toastMessage.type === 'error'
              ? 'bg-[#B42332] border-white/30'
              : toastMessage.type === 'warn'
              ? 'bg-[#886828] border-white/30'
              : 'bg-[#123B32] border-[#63DCE8]/40'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-white" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#63DCE8]" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
