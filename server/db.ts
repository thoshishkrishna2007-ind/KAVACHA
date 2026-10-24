import fs from 'fs';
import path from 'path';
import { CareTransition } from '../src/types/clinical';
import { INITIAL_PATIENTS } from '../src/data/mockPatients';
import { 
  UserRole, 
  UserProfile, 
  AuditEvent, 
  AppNotification, 
  DEMO_USERS, 
  INITIAL_AUDIT_EVENTS, 
  INITIAL_NOTIFICATIONS 
} from '../src/types/backend';

export type { UserRole, UserProfile, AuditEvent, AppNotification };
export { DEMO_USERS, INITIAL_AUDIT_EVENTS, INITIAL_NOTIFICATIONS };

export interface DatabaseSchema {
  users: UserProfile[];
  patients: CareTransition[];
  auditEvents: AuditEvent[];
  notifications: AppNotification[];
  systemSettings: {
    hospitalName: string;
    nodeId: string;
    simulationMode: boolean;
    lastSeedTime: string;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'app_db.json');

class DatabaseManager {
  private db: DatabaseSchema | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
        console.log('[Database] Loaded existing persistence database with', this.db?.patients.length, 'patients.');
        return;
      } catch (err) {
        console.error('[Database] Error reading database file, re-seeding:', err);
      }
    }

    this.resetToSeed();
  }

  public resetToSeed(): DatabaseSchema {
    this.db = {
      users: DEMO_USERS,
      patients: JSON.parse(JSON.stringify(INITIAL_PATIENTS)),
      auditEvents: JSON.parse(JSON.stringify(INITIAL_AUDIT_EVENTS)),
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
      systemSettings: {
        hospitalName: 'Emerald Regional Medical Center',
        nodeId: 'NODE-ALPHA-CORE',
        simulationMode: true,
        lastSeedTime: new Date().toISOString(),
      },
    };
    this.save();
    console.log('[Database] Reset and seeded database with', this.db.patients.length, 'patients.');
    return this.db;
  }

  private save() {
    if (!this.db) return;
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.db, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[Database] Error saving database:', err);
    }
  }

  public getDb(): DatabaseSchema {
    if (!this.db) {
      this.init();
    }
    return this.db!;
  }

  public getPatients(): CareTransition[] {
    return this.getDb().patients;
  }

  public getPatientById(id: string): CareTransition | undefined {
    return this.getDb().patients.find(p => p.id === id);
  }

  public savePatient(patient: CareTransition): CareTransition {
    const db = this.getDb();
    const idx = db.patients.findIndex(p => p.id === patient.id);
    if (idx >= 0) {
      db.patients[idx] = patient;
    } else {
      db.patients.unshift(patient);
    }
    this.save();
    return patient;
  }

  public getUsers(): UserProfile[] {
    return this.getDb().users;
  }

  public getUserById(id: string): UserProfile | undefined {
    return this.getDb().users.find(u => u.id === id);
  }

  public getUserByRole(role: UserRole): UserProfile | undefined {
    return this.getDb().users.find(u => u.role === role);
  }

  public logAudit(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const db = this.getDb();
    const newEvent: AuditEvent = {
      ...event,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    db.auditEvents.unshift(newEvent);
    if (db.auditEvents.length > 1000) {
      db.auditEvents.pop();
    }
    this.save();
    return newEvent;
  }

  public getAuditEvents(filters?: {
    patientId?: string;
    role?: string;
    action?: string;
  }): AuditEvent[] {
    let events = this.getDb().auditEvents;
    if (filters?.patientId) {
      events = events.filter(e => e.transitionId === filters.patientId);
    }
    if (filters?.role) {
      events = events.filter(e => e.actorRole === filters.role);
    }
    if (filters?.action) {
      events = events.filter(e => e.action.toLowerCase().includes(filters.action!.toLowerCase()));
    }
    return events;
  }

  public getNotifications(): AppNotification[] {
    return this.getDb().notifications;
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
    const db = this.getDb();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: 'Just now',
    };
    db.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  public markNotificationAsRead(id: string): boolean {
    const db = this.getDb();
    const notif = db.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(): void {
    const db = this.getDb();
    db.notifications.forEach(n => { n.read = true; });
    this.save();
  }
}

export const dbManager = new DatabaseManager();
