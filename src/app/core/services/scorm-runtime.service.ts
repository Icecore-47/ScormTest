// src/app/core/services/scorm-runtime.service.ts
import { Injectable } from '@angular/core';
import { LearningAttempt, ScormRuntimeSnapshot, ScormInteraction } from '../../shared/models/scorm-attempt.model';
import { ContentPackage, ContentStandard } from '../../shared/models/content-package.model';
import { UserService } from './user.service';
import { StorageService } from './storage.service';
import { ApiClientService } from './api-client.service';
import { v4 as uuidv4 } from 'uuid';

declare global {
  interface Window {
    API?: any;
    API_1484_11?: any;
  }
}

interface ScormErrorState {
  lastError: string;
  lastErrorString: string;
  lastDiagnostic: string;
}

@Injectable({ providedIn: 'root' })
export class ScormRuntimeService {
  private currentAttempt?: LearningAttempt;
  private currentRuntime: ScormRuntimeSnapshot = { data: {}, interactions: [] };
  private errorState: ScormErrorState = {
    lastError: '0',
    lastErrorString: 'No error',
    lastDiagnostic: ''
  };
  private initialized = false;
  private terminated = false;
  private standard: ContentStandard | null = null;

  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private apiClient: ApiClientService
  ) {
    (window as Window).API = this.createScorm12Api();
    (window as Window).API_1484_11 = this.createScorm2004Api();
  }

  startAttempt(contentPackage: ContentPackage): LearningAttempt {
    const user = this.userService.currentUser;
    const attempts = this.storageService.loadAttempts();
    const newAttempt: LearningAttempt = {
      id: uuidv4(),
      userId: user.id,
      contentPackageId: contentPackage.id,
      standard: contentPackage.standard,
      startedAt: new Date().toISOString(),
      status: 'in-progress',
      success: 'unknown'
    };
    attempts.push(newAttempt);
    this.storageService.saveAttempts(attempts);
    this.apiClient.saveAttempt(newAttempt).subscribe();

    this.currentAttempt = newAttempt;
    this.standard = contentPackage.standard;
    this.currentRuntime = { data: {}, interactions: [] };
    this.initialized = false;
    this.terminated = false;
    this.resetErrorState();

    console.log('[ScormRuntimeService] Started attempt', newAttempt);
    return newAttempt;
  }

  getCurrentAttempt(): LearningAttempt | undefined {
    return this.currentAttempt;
  }

  private resetErrorState(): void {
    this.errorState = {
      lastError: '0',
      lastErrorString: 'No error',
      lastDiagnostic: ''
    };
  }

  private createScorm12Api(): any {
    const self = this;
    return {
      LMSInitialize(parameter: string): string {
        return self.handleInitialize('SCORM_12', parameter);
      },
      LMSFinish(parameter: string): string {
        return self.handleTerminate('SCORM_12', parameter);
      },
      LMSGetValue(element: string): string {
        return self.handleGetValue('SCORM_12', element);
      },
      LMSSetValue(element: string, value: string): string {
        return self.handleSetValue('SCORM_12', element, value);
      },
      LMSCommit(parameter: string): string {
        return self.handleCommit('SCORM_12', parameter);
      },
      LMSGetLastError(): string {
        return self.errorState.lastError;
      },
      LMSGetErrorString(errorCode: string): string {
        return self.errorState.lastErrorString;
      },
      LMSGetDiagnostic(errorCode: string): string {
        return self.errorState.lastDiagnostic;
      }
    };
  }

  private createScorm2004Api(): any {
    const self = this;
    return {
      Initialize(parameter: string): string {
        return self.handleInitialize('SCORM_2004', parameter);
      },
      Terminate(parameter: string): string {
        return self.handleTerminate('SCORM_2004', parameter);
      },
      GetValue(element: string): string {
        return self.handleGetValue('SCORM_2004', element);
      },
      SetValue(element: string, value: string): string {
        return self.handleSetValue('SCORM_2004', element, value);
      },
      Commit(parameter: string): string {
        return self.handleCommit('SCORM_2004', parameter);
      },
      GetLastError(): string {
        return self.errorState.lastError;
      },
      GetErrorString(errorCode: string): string {
        return self.errorState.lastErrorString;
      },
      GetDiagnostic(errorCode: string): string {
        return self.errorState.lastDiagnostic;
      }
    };
  }

  private handleInitialize(standard: ContentStandard, parameter: string): string {
    console.log('[ScormRuntimeService] Initialize called', { standard, parameter });
    if (this.initialized) {
      this.setError('101', 'Already initialized', 'Initialize called more than once');
      return 'false';
    }
    this.initialized = true;
    this.standard = standard;
    this.resetErrorState();

    if (standard === 'SCORM_12') {
      this.currentRuntime.data['cmi.core.student_id'] = this.userService.currentUser.id;
      this.currentRuntime.data['cmi.core.student_name'] = this.userService.currentUser.displayName;
    } else if (standard === 'SCORM_2004') {
      this.currentRuntime.data['cmi.learner_id'] = this.userService.currentUser.id;
      this.currentRuntime.data['cmi.learner_name'] = this.userService.currentUser.displayName;
    }

    return 'true';
  }

  private handleTerminate(standard: ContentStandard, parameter: string): string {
    console.log('[ScormRuntimeService] Terminate called', { standard, parameter });
    if (!this.initialized || this.terminated) {
      this.setError('301', 'Not initialized or already terminated', 'Terminate called in invalid state');
      return 'false';
    }
    this.terminated = true;
    this.persistRuntime('terminate');
    this.resetErrorState();

    const attempts = this.storageService.loadAttempts();
    if (this.currentAttempt) {
      const idx = attempts.findIndex(a => a.id === this.currentAttempt!.id);
      if (idx !== -1) {
        attempts[idx].endedAt = new Date().toISOString();
        attempts[idx].status = 'completed';
        attempts[idx].runtimeSnapshot = this.currentRuntime;
      }
      this.storageService.saveAttempts(attempts);
      this.apiClient.saveAttempt(attempts[idx]).subscribe();
      this.apiClient.saveRuntimeSnapshot(this.currentAttempt.id, this.currentRuntime).subscribe();
    }

    return 'true';
  }

  private handleGetValue(standard: ContentStandard, element: string): string {
    console.log('[ScormRuntimeService] GetValue called', { standard, element });
    if (!this.initialized) {
      this.setError('301', 'Not initialized', 'GetValue called before Initialize');
      return '';
    }
    this.resetErrorState();
    const value = this.currentRuntime.data[element] ?? '';
    return value;
  }

  private handleSetValue(standard: ContentStandard, element: string, value: string): string {
    console.log('[ScormRuntimeService] SetValue called', { standard, element, value });
    if (!this.initialized) {
      this.setError('301', 'Not initialized', 'SetValue called before Initialize');
      return 'false';
    }

    if (element.startsWith('cmi.interactions')) {
      this.trackInteraction(element, value);
    } else {
      this.currentRuntime.data[element] = value;
    }

    this.resetErrorState();
    return 'true';
  }

  private handleCommit(standard: ContentStandard, parameter: string): string {
    console.log('[ScormRuntimeService] Commit called', { standard, parameter });
    if (!this.initialized) {
      this.setError('301', 'Not initialized', 'Commit called before Initialize');
      return 'false';
    }
    this.persistRuntime('commit');
    this.resetErrorState();
    return 'true';
  }

  private trackInteraction(element: string, value: string): void {
    const match = element.match(/^cmi\.interactions\.(\d+)\.(.+)$/);
    if (!match) {
      this.currentRuntime.data[element] = value;
      return;
    }
    const index = parseInt(match[1], 10);
    const property = match[2];

    while (this.currentRuntime.interactions.length <= index) {
      this.currentRuntime.interactions.push({ id: `${index}` });
    }
    const interaction: ScormInteraction = this.currentRuntime.interactions[index];

    switch (property) {
      case 'id':
        interaction.id = value;
        break;
      case 'type':
        interaction.type = value;
        break;
      case 'student_response':
      case 'learner_response':
        interaction.learnerResponse = value;
        break;
      case 'result':
        interaction.result = value;
        break;
      case 'description':
        interaction.description = value;
        break;
      case 'timestamp':
        interaction.timestamp = value;
        break;
      default:
        this.currentRuntime.data[element] = value;
        break;
    }
  }

  private persistRuntime(context: 'commit' | 'terminate'): void {
    if (!this.currentAttempt) {
      console.warn('[ScormRuntimeService] persistRuntime called without active attempt');
      return;
    }

    const completion = this.currentRuntime.data['cmi.core.lesson_status']
      || this.currentRuntime.data['cmi.completion_status'];
    const success = this.currentRuntime.data['cmi.success_status'];

    let scoreRaw: number | undefined;
    let scoreScaled: number | undefined;

    if (this.currentRuntime.data['cmi.core.score.raw']) {
      scoreRaw = parseFloat(this.currentRuntime.data['cmi.core.score.raw']);
    } else if (this.currentRuntime.data['cmi.score.raw']) {
      scoreRaw = parseFloat(this.currentRuntime.data['cmi.score.raw']);
    }

    if (this.currentRuntime.data['cmi.score.scaled']) {
      scoreScaled = parseFloat(this.currentRuntime.data['cmi.score.scaled']);
    }

    const attempts = this.storageService.loadAttempts();
    const idx = attempts.findIndex(a => a.id === this.currentAttempt!.id);
    if (idx !== -1) {
      attempts[idx].runtimeSnapshot = this.currentRuntime;
      if (completion) {
        attempts[idx].status = completion === 'completed' || completion === 'passed' ? 'completed' : 'in-progress';
        attempts[idx].success =
          success === 'passed'
            ? 'passed'
            : success === 'failed'
              ? 'failed'
              : attempts[idx].success ?? 'unknown';
      }
      attempts[idx].scoreRaw = scoreRaw;
      attempts[idx].scoreScaled = scoreScaled;
      this.storageService.saveAttempts(attempts);
      this.apiClient.saveAttempt(attempts[idx]).subscribe();
      this.apiClient.saveRuntimeSnapshot(this.currentAttempt.id, this.currentRuntime).subscribe();
      console.log('[ScormRuntimeService] Runtime persisted at', context);
    }
  }

  private setError(code: string, message: string, diagnostic: string): void {
    this.errorState.lastError = code;
    this.errorState.lastErrorString = message;
    this.errorState.lastDiagnostic = diagnostic;
    console.warn('[ScormRuntimeService] Error set', this.errorState);
  }
}
