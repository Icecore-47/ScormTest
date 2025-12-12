// src/app/core/services/cmi5.service.ts
import { Injectable } from '@angular/core';
import { XapiService } from './xapi.service';
import { ContentPackage } from '../../shared/models/content-package.model';

export interface Cmi5Session {
  registration: string;
  launchedAt: string;
  endedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class Cmi5Service {
  private currentSession?: Cmi5Session;

  constructor(private xapiService: XapiService) {}

  startSession(contentPackage: ContentPackage): Cmi5Session {
    const registration = crypto.randomUUID();
    const session: Cmi5Session = {
      registration,
      launchedAt: new Date().toISOString()
    };
    this.currentSession = session;
    console.log('[Cmi5Service] cmi5 session started', session);

    this.xapiService.sendLaunched(contentPackage, registration);
    return session;
  }

  completeSession(contentPackage: ContentPackage, passed: boolean, scoreRaw?: number, scoreScaled?: number): void {
    if (!this.currentSession) {
      console.warn('[Cmi5Service] completeSession called without active session');
      return;
    }
    this.currentSession.endedAt = new Date().toISOString();
    console.log('[Cmi5Service] cmi5 session completed', this.currentSession);

    this.xapiService.sendCompleted(
      contentPackage,
      {
        score: {
          raw: scoreRaw,
          scaled: scoreScaled
        },
        success: passed,
        completion: true
      },
      this.currentSession.registration
    );
  }

  getCurrentSession(): Cmi5Session | undefined {
    return this.currentSession;
  }
}
