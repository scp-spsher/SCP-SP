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
