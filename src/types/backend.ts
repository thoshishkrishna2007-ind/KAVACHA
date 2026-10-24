export type UserRole = 
  | 'nurse' 
  | 'physician' 
  | 'pharmacist' 
  | 'transport' 
  | 'receiving_nurse' 
  | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department: string;
  badgeNumber: string;
}

export interface AuditEvent {
  id: string;
  transitionId: string;
  patientName: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'transition' | 'stage' | 'checklist' | 'medication' | 'sbar' | 'transport' | 'security';
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AppNotification {
  id: string;
  transitionId: string;
  patientName: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'resolved';
  category: 'clinical' | 'medication' | 'transport' | 'handoff' | 'system';
  read: boolean;
  createdAt: string;
}

export interface DrugPharmacologyProfile {
  name: string;
  genericName: string;
  pubchemCid?: number;
  molecularFormula?: string;
  molecularWeight?: string;
  canonicalSmiles?: string;
  chemicalStructure2dUrl?: string;
  fdaBoxedWarning?: string;
  contraindications?: string;
  drugInteractions?: string;
  highAlertCategory: 'anticoagulant' | 'inotropic' | 'sedative' | 'insulin' | 'neuromuscular' | 'standard';
  monitoringProtocol: string;
}

export interface ReadinessBreakdown {
  overallScore: number; // 0 - 100
  canAdvanceCurrentStage: boolean;
  stageBlockers: string[];
  mandatoryCriteriaTotal: number;
  mandatoryCriteriaMet: number;
  optionalCriteriaTotal: number;
  optionalCriteriaMet: number;
  componentScores: {
    clinicalReview: number;      // Weight: 20%
    medicationReconciliation: number; // Weight: 25%
    sbarHandshake: number;       // Weight: 20%
    transportReadiness: number;  // Weight: 20%
    receivingIngestion: number;  // Weight: 15%
  };
  unmetMandatoryItems: {
    stageId: number;
    stageName: string;
    itemLabel: string;
    discipline: string;
  }[];
  explanation: string;
}

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'usr-nurse-1',
    name: 'Sarah Jensen, BSN, RN, CCRN',
    email: 'sarah.jensen@emeraldshield.health',
    role: 'nurse',
    title: 'Primary Intensive Care Nurse',
    department: 'Cardiovascular ICU',
    badgeNumber: 'RN-9842',
  },
  {
    id: 'usr-phys-1',
    name: 'Dr. Katherine Miller, MD, FACS',
    email: 'katherine.miller@emeraldshield.health',
    role: 'physician',
    title: 'Attending Cardiothoracic Surgeon',
    department: 'Surgical Services',
    badgeNumber: 'MD-4109',
  },
  {
    id: 'usr-pharm-1',
    name: 'R. Gupta, PharmD, BCPS',
    email: 'r.gupta@emeraldshield.health',
    role: 'pharmacist',
    title: 'Lead Critical Care Clinical Pharmacist',
    department: 'Clinical Pharmacy',
    badgeNumber: 'PH-7714',
  },
  {
    id: 'usr-trans-1',
    name: 'Marcus Bell, CCT-P',
    email: 'marcus.bell@emeraldshield.health',
    role: 'transport',
    title: 'Critical Care Transport Specialist',
    department: 'Emergency & Patient Transit',
    badgeNumber: 'TR-3390',
  },
  {
    id: 'usr-rec-1',
    name: 'Brenda Hayes, BSN, RN, PCCN',
    email: 'brenda.hayes@emeraldshield.health',
    role: 'receiving_nurse',
    title: 'Step-Down Telemetry Charge Nurse',
    department: '4-West Telemetry',
    badgeNumber: 'RN-4411',
  },
  {
    id: 'usr-admin-1',
    name: 'Dr. Arthur Sterling, MD, MBA',
    email: 'arthur.sterling@emeraldshield.health',
    role: 'admin',
    title: 'Chief Medical Quality Officer & System Administrator',
    department: 'Clinical Operations & Quality',
    badgeNumber: 'ADM-001',
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    transitionId: 'tr-0943',
    patientName: 'Amara Okafor',
    title: 'Critical BP Elevation in Antepartum',
    message: 'BP 158/104 sustained on continuous monitor. STAT Magnesium check and OR prep prioritized.',
    severity: 'critical',
    category: 'clinical',
    read: false,
    createdAt: '12 min ago',
  },
  {
    id: 'notif-2',
    transitionId: 'tr-0941',
    patientName: 'Eleanor Vance',
    title: 'Stage 03 Handshake Pending',
    message: 'Receiving bed 4W-12 sanitized and confirmed. Awaiting verbal SBAR nurse-to-nurse call.',
    severity: 'info',
    category: 'handoff',
    read: false,
    createdAt: '24 min ago',
  },
  {
    id: 'notif-3',
    transitionId: 'tr-0942',
    patientName: 'Marcus Chen',
    title: 'Transport Escort Dispatched',
    message: 'Internal transit crew assigned for wheelchair transfer to Inpatient Neuro Rehabilitation.',
    severity: 'info',
    category: 'transport',
    read: true,
    createdAt: '40 min ago',
  },
  {
    id: 'notif-4',
    transitionId: 'tr-0945',
    patientName: 'Sofia Lindqvist',
    title: 'Code STEMI Door-to-Balloon Priority',
    message: 'Direct expedited gurney roll to Cath Lab Suite 2 underway with monitor-defibrillator.',
    severity: 'warning',
    category: 'clinical',
    read: false,
    createdAt: '5 min ago',
  },
];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud-101',
    transitionId: 'tr-0941',
    patientName: 'Eleanor Vance',
    actorId: 'usr-phys-1',
    actorName: 'Dr. Katherine Miller, MD',
    actorRole: 'physician',
    action: 'CLINICAL_APPROVAL_SIGNED',
    entityType: 'stage',
    details: 'Verified Stage 01 extubation stability criteria and signed morning lab clearances.',
    timestamp: '2026-10-24 06:45:10',
  },
  {
    id: 'aud-102',
    transitionId: 'tr-0941',
    patientName: 'Eleanor Vance',
    actorId: 'usr-pharm-1',
    actorName: 'R. Gupta, PharmD',
    actorRole: 'pharmacist',
    action: 'MEDICATION_RECON_ATTESTED',
    entityType: 'medication',
    details: 'Milrinone cessation verified; oral beta-blocker step-down protocol reconciled and approved.',
    timestamp: '2026-10-24 07:15:22',
  },
  {
    id: 'aud-103',
    transitionId: 'tr-0944',
    patientName: 'Donald Reyes',
    actorId: 'usr-nurse-1',
    actorName: 'Sarah Jensen, RN',
    actorRole: 'nurse',
    action: 'POLST_GOLD_SHEET_SEALED',
    entityType: 'checklist',
    details: 'Verified DNR/DNI status and placed executed advance directives in transport lock envelope.',
    timestamp: '2026-10-24 07:30:00',
  },
  {
    id: 'aud-104',
    transitionId: 'tr-0945',
    patientName: 'Sofia Lindqvist',
    actorId: 'usr-nurse-1',
    actorName: 'Lt. Ethan Cross, RN',
    actorRole: 'nurse',
    action: 'CODE_STEMI_ACTIVATED',
    entityType: 'transition',
    details: 'Door-to-balloon pathway activated at 07:14. Cath lab suite 2 confirmed prepared.',
    timestamp: '2026-10-24 07:14:05',
  },
];
