import { CareTransition } from '../types/clinical';
import { 
  UserRole, 
  UserProfile, 
  AuditEvent, 
  AppNotification, 
  ReadinessBreakdown, 
  DrugPharmacologyProfile 
} from '../types/backend';

let currentRole: UserRole = 'nurse';

export function setApiDemoRole(role: UserRole) {
  currentRole = role;
}

export function getApiDemoRole(): UserRole {
  return currentRole;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'X-Demo-Role': currentRole,
    ...(options.headers || {}),
  };

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `Server error ${res.status}: ${res.statusText}`;
    try {
      const errorJson = await res.json();
      if (errorJson.error) {
        errorMsg = errorJson.error;
        if (errorJson.reason) {
          errorMsg += ` — ${errorJson.reason}`;
        }
        if (errorJson.unresolvedBlockers && Array.isArray(errorJson.unresolvedBlockers)) {
          errorMsg += `\nBlockers:\n• ` + errorJson.unresolvedBlockers.join('\n• ');
        }
      }
    } catch (e) {
      // not JSON
    }
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Patients
  getPatients: () => request<CareTransition[]>('/patients'),
  getPatientById: (id: string) => request<{ patient: CareTransition; readiness: ReadinessBreakdown }>(`/patients/${id}`),
  createPatient: (data: Partial<CareTransition>) => request<CareTransition>('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Workflow Gates
  toggleChecklist: (patientId: string, stageId: number, checkId: string) => 
    request<{ patient: CareTransition; readiness: ReadinessBreakdown }>(`/patients/${patientId}/checklist`, {
      method: 'PUT',
      body: JSON.stringify({ stageId, checkId }),
    }),

  advanceStage: (patientId: string) =>
    request<{ success: boolean; patient: CareTransition; readiness: ReadinessBreakdown }>(`/patients/${patientId}/advance-stage`, {
      method: 'POST',
    }),

  // Medication Reconciliation
  updateMedication: (patientId: string, medicationId: string, status?: string, notes?: string) =>
    request<CareTransition>(`/patients/${patientId}/medication`, {
      method: 'PUT',
      body: JSON.stringify({ medicationId, status, notes }),
    }),

  // SBAR
  updateSbar: (patientId: string, data: { situation?: string; background?: string; assessment?: string; recommendation?: string; acknowledge?: boolean }) =>
    request<CareTransition>(`/patients/${patientId}/sbar`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Transport
  updateTransport: (patientId: string, data: { status?: string; etaMinutes?: number; equipment?: string[]; escortTeam?: string }) =>
    request<CareTransition>(`/patients/${patientId}/transport`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Audit Events
  getAuditEvents: (filters?: { patientId?: string; role?: string; action?: string }) => {
    const params = new URLSearchParams();
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.action) params.append('action', filters.action);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<AuditEvent[]>(`/audit-events${query}`);
  },

  // Notifications
  getNotifications: () => request<AppNotification[]>('/notifications'),
  markNotificationRead: (id: string) => request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<{ success: boolean }>('/notifications/read-all', { method: 'PUT' }),

  // Analytics
  getAnalytics: () => request<{
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
  }>('/analytics'),

  // Scenarios
  executeScenario: (scenarioId: string) =>
    request<{ message: string; patient: CareTransition }>(`/scenarios/${scenarioId}/execute`, { method: 'POST' }),

  // Demo Reset
  resetDemoDatabase: () => request<{ message: string }>('/demo/reset', { method: 'POST' }),

  // Science / Bioscience Pharmacology
  getDrugPharmacology: (drugName: string) =>
    request<DrugPharmacologyProfile>(`/science/pharmacology?drug=${encodeURIComponent(drugName)}`),
};
