export type AcuityLevel = 'critical' | 'guarded' | 'stable' | 'discharge-ready';

export type StageStatus = 'completed' | 'active' | 'pending' | 'flagged';

export interface TelemetryReading {
  heartRate: number;
  bloodPressure: string; // e.g. "124/78"
  spo2: number; // percentage
  respiratoryRate: number;
  meanArterialPressure: number; // mmHg
  cardiacRhythm: string; // e.g. "Sinus with occasional PACs"
  temperature: number; // in Celsius e.g. 37.1
  lastUpdated: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  category: 'infusion' | 'antibiotic' | 'cardiac' | 'analgesic' | 'anticoagulant' | 'maintenance';
  reconciliationStatus: 'verified' | 'pending' | 'discontinued' | 'adjusted';
  verifiedBy?: string;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  discipline: 'Nursing' | 'Physician' | 'Pharmacy' | 'Physical Therapy' | 'Case Management' | 'Transport';
  completed: boolean;
  completedBy?: string;
  timestamp?: string;
  requiredForAdvance: boolean;
  notes?: string;
}

export interface TransitionStage {
  id: number;
  name: string;
  shortLabel: string;
  description: string;
  leadDiscipline: string;
  status: StageStatus;
  checklists: ChecklistItem[];
  verifiedAt?: string;
  verifiedBy?: string;
  targetCompletionTime?: string;
}

export interface SbarReport {
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  sendingNurse: string;
  receivingNurse: string;
  attendingPhysician: string;
  completedAt?: string;
  verifiedHash?: string;
}

export interface TransportLogistics {
  mode: 'Wheelchair' | 'Stretcher' | 'Critical Care Transport (CCT)' | 'BLS Ambulance' | 'ALS Helicopter';
  escortRequired: boolean;
  escortTeam: string;
  equipment: string[];
  isolationPrecautions?: string;
  scheduledTime: string;
  etaMinutes: number;
  transportStatus: 'Scheduled' | 'Crew En Route' | 'At Bedside' | 'In Transit' | 'Handed Over';
}

export interface CareTransition {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: 'F' | 'M' | 'Other';
  admissionDate: string;
  diagnosis: string;
  sourceUnit: string;
  targetUnit: string;
  targetBed: string;
  acuity: AcuityLevel;
  shieldScore: number; // 0 - 100% protocol adherence
  currentStageId: number;
  stages: TransitionStage[];
  telemetry: TelemetryReading;
  medications: MedicationItem[];
  sbar: SbarReport;
  transport: TransportLogistics;
  allergies: string[];
  codeStatus: 'FULL CODE' | 'DNR' | 'DNI' | 'DNR/DNI' | 'LIMITED INTERVENTION';
  fallRisk: 'High' | 'Moderate' | 'Low';
  isolationType?: 'Contact' | 'Droplet' | 'Airborne' | 'Enhanced' | 'None';
  estimatedHandoffDuration: string;
  assignedCoordinator: string;
  lastAuditNote: string;
}
