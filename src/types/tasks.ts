import type { TaskCalendar } from '@/types/calendar';

export type Intensity = 'low' | 'medium' | 'high';
export type ProofType = 'photo' | 'video' | 'timelapse';
export type SignatureMode = 'signature' | 'image';
export type AdvanceReminder = { kind: 'none' | 'five' | 'ten' } | { kind: 'days'; days: number };

export type TaskCompanion = {
  email: string;
  avatarUri?: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  calendar?: TaskCalendar;
  dueDate: string;
  dueTime: string;
  advanceReminder?: AdvanceReminder;
  intensity: Intensity;
  proofType: ProofType;
  signedBy: string;
  signatureMode: SignatureMode;
  signatureImageUri: string;
  createdAt: string;
  companions?: TaskCompanion[];
  ownerId?: string;
  archivedAt?: string;
};

export type TaskDraft = Omit<Task, 'createdAt' | 'ownerId' | 'archivedAt'>;

export type TaskUpdate = Pick<TaskDraft, 'title' | 'description' | 'calendar' | 'dueDate' | 'dueTime' | 'intensity' | 'advanceReminder'>;

export type TaskStatus = 'pending' | 'overdue' | 'completed' | 'completedLate';

export type TaskCompletion = {
  id: string;
  taskId: string;
  date: string;
  createdAt: string;
};
