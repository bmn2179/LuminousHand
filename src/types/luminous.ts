export type AppRoute =
  | 'home'
  | 'labs'
  | 'alphabet'
  | 'numbers'
  | 'colors'
  | 'video-studio'
  | 'supervisor'
  | 'progress'
  | 'pricing'
  | 'about'
  | 'contact'
  | 'terms';

export type LessonCategory = 'alphabet' | 'numbers' | 'colors';

export type AgentRole = 'supervisor' | 'alphabet' | 'numbers' | 'colors' | 'video';

export interface AlphabetLesson {
  id: string;
  letter: string;
  word: string;
  emoji: string;
  aslCue: string;
  driveFileId?: string;
}

export interface NumberLesson {
  id: string;
  digit: number;
  word: string;
  aslCue: string;
}

export interface ColorLesson {
  id: string;
  name: string;
  hex: string;
  textLight: boolean;
  emoji: string;
  objectName: string;
  aslCue: string;
}

export interface AslVideoEntry {
  id: string;
  lessonId: string;
  category: LessonCategory;
  label: string;
  videoUrl: string;
  signerName: string;
  signerType: 'kid' | 'adult' | 'deaf-mentor';
  verified: boolean;
  localPreviewUrl?: string;
}

export interface LearningWorkflow {
  id: string;
  title: string;
  summary: string;
  focusArea: 'alphabet' | 'numbers' | 'colors' | 'video-production';
  assignedAgent: string;
  nextLessons: string[];
  status: 'active' | 'completed';
  subAgentAssignments?: {
    agentName: string;
    role: AgentRole;
    task: string;
  }[];
  createdAtIso?: string;
}

export interface AgentRagFile {
  id: string;
  agentName: string;
  agentRole: AgentRole;
  markdownContent: string;
  chunks: string[];
  version: number;
  updatedAtIso?: string;
}

export interface UserAccountState {
  uid: string;
  displayName: string;
  learnerName: string;
  role: 'parent' | 'educator';
  selectedPlan: 'free' | 'family' | 'classroom';
  soundEnabled: boolean;
  completedLessons: string[];
}
