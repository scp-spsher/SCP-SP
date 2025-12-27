
export const SecurityClearance = {
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
  LEVEL_4: 4,
  LEVEL_5: 5,
  OMNI: 6
} as const;

export type SecurityClearance = typeof SecurityClearance[keyof typeof SecurityClearance];

export interface UserProfile {
  id: string;
  name: string;
  title: string;
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

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system' | 'ai';
  text: string;
  timestamp: Date;
}

export interface TerminalLog {
  id: string;
  type: 'input' | 'output' | 'error' | 'success';
  content: string;
}
