// src/app/core/services/storage.service.ts
import { Injectable } from '@angular/core';
import { LearningAttempt } from '../../shared/models/scorm-attempt.model';

const ATTEMPTS_KEY = 'lrp_attempts';
const XAPI_KEY = 'lrp_xapi_statements';

@Injectable()
export class StorageService {
  saveAttempts(attempts: LearningAttempt[]): void {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  }

  loadAttempts(): LearningAttempt[] {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as LearningAttempt[];
      return parsed;
    } catch (err) {
      console.error('[StorageService] Failed to parse attempts from localStorage', err);
      return [];
    }
  }

  saveXapiStatements(statements: unknown[]): void {
    localStorage.setItem(XAPI_KEY, JSON.stringify(statements));
  }

  loadXapiStatements(): unknown[] {
    const raw = localStorage.getItem(XAPI_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as unknown[];
      return parsed;
    } catch (err) {
      console.error('[StorageService] Failed to parse xAPI statements from localStorage', err);
      return [];
    }
  }
}
