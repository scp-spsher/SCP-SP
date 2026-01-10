
export const SecurityClearance = {
  LEVEL_0: 0,
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
  LEVEL_4: 4,
  LEVEL_5: 5,
  OMNI: 6
} as const;

export type SecurityClearance = typeof SecurityClearance[keyof typeof SecurityClearance];

export const DEPARTMENTS = [
  'Научная Служба',
  'Служба Безопасности',
  'Обслуживающий Персонал',
  'Мед Служба',
  'МОГ',
  'ОВБ',
  'Административная служба'
] as const;

export type Department = typeof DEPARTMENTS[number];

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  department: string;
  cover_department?: string;
  clearance: SecurityClearance;
  site: string;
}

export const ObjectClass = {
  SAFE: 'SAFE',
  EUCLID: 'EUCLID',
  KETER: 'KETER',
  THAUMIEL: 'THAUMIEL',
  NEUTRALIZED: 'NEUTRALIZED'
} as const;

export type ObjectClass = typeof ObjectClass[keyof typeof ObjectClass];

export interface SCPFile {
  id: string;
  itemNumber: string;
  objectClass: ObjectClass;
  containmentProcedures: string;
  description: string;
  image?: string; // URL
  isRedacted: boolean;
  lastUpdated: string;
}

export type ReportType = 'INCIDENT' | 'OBSERVATION' | 'AUDIT' | 'REQUEST' | 'SECURITY';

export interface SCPReport {
  id: string;
  author_id: string;
  author_name: string;
  author_clearance: number;
  type: ReportType;
  title: string;
  content: string;
  target_id?: string; // e.g. SCP-173
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at: string;
  is_archived: boolean;
  image_url?: string;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface SCPTask {
  id: string;
  title: string;
  description: string;
  assigned_department: string; // Заменено с assigned_to (UUID) на отдел
  created_by: string; // UUID создателя
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system' | 'ai';
  text: string;
  timestamp: Date;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  text: string;
  created_at: string;
}

export interface TerminalLog {
  id: string;
  type: 'input' | 'output' | 'error' | 'success';
  content: string;
}
