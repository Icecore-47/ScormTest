// src/app/shared/models/scorm-attempt.model.ts
import { ContentStandard } from './content-package.model';

export interface ScormInteraction {
  id: string;
  type?: string;
  learnerResponse?: string;
  result?: string;
  description?: string;
  timestamp?: string;
}

export interface ScormRuntimeSnapshot {
  data: Record<string, string>;
  interactions: ScormInteraction[];
  completionStatus?: string;
  successStatus?: string;
  scoreRaw?: number;
  scoreScaled?: number;
  totalTime?: string;
  sessionTime?: string;
}

export interface LearningAttempt {
  id: string;
  userId: string;
  contentPackageId: string;
  standard: ContentStandard;
  startedAt: string;
  endedAt?: string;
  status: 'not-started' | 'in-progress' | 'completed';
  success?: 'unknown' | 'passed' | 'failed';
  scoreRaw?: number;
  scoreScaled?: number;
  runtimeSnapshot?: ScormRuntimeSnapshot;
}
