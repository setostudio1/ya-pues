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
};

export type TaskDraft = Omit<Task, 'createdAt' | 'ownerId'>;

export type TaskCompletion = {
  id: string;
  taskId: string;
  date: string;
  createdAt: string;
};
