export type Intensity = 'low' | 'medium' | 'high';
export type ProofType = 'photo' | 'video' | 'timelapse';
export type SignatureMode = 'signature' | 'image';

export type TaskCompanion = {
  email: string;
  avatarUri?: string;
};

export type Task = {
  id: string;
  title: string;
  dueDate: string;
  dueTime: string;
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

export type TaskUpdate = Pick<TaskDraft, 'title' | 'dueDate' | 'dueTime' | 'intensity'>;

export type TaskStatus = 'pending' | 'overdue' | 'completed' | 'completedLate';

export type TaskCompletion = {
  id: string;
  taskId: string;
  date: string;
  createdAt: string;
};
