// src/app/core/services/api-client.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LearningAttempt } from '../../shared/models/scorm-attempt.model';
import { XapiStatement } from '../../shared/models/xapi.model';
import { Observable, of } from 'rxjs';

@Injectable()
export class ApiClientService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly lrsEndpoint = environment.lrsEndpoint;

  constructor(private http: HttpClient) {}

  saveAttempt(attempt: LearningAttempt): Observable<void> {
    console.log('[ApiClientService] saveAttempt called with payload:', attempt);
    console.log('[ApiClientService] Intended API endpoint:', `${this.baseUrl}/attempts`);
    // In future: return this.http.post<void>(`${this.baseUrl}/attempts`, attempt);
    return of(void 0);
  }

  saveRuntimeSnapshot(attemptId: string, snapshot: LearningAttempt['runtimeSnapshot']): Observable<void> {
    console.log('[ApiClientService] saveRuntimeSnapshot called for attempt', attemptId, 'snapshot:', snapshot);
    console.log('[ApiClientService] Intended API endpoint:', `${this.baseUrl}/attempts/${attemptId}/runtime`);
    return of(void 0);
  }

  sendXapiStatements(statements: XapiStatement[]): Observable<void> {
    console.log('[ApiClientService] sendXapiStatements called. LRS endpoint:', this.lrsEndpoint);
    console.log('[ApiClientService] Statements:', statements);
    // In future: return this.http.post<void>(this.lrsEndpoint, statements, { headers: { 'X-Experience-API-Version': '1.0.3' }});
    return of(void 0);
  }

  exportAttemptsCsv(): Observable<Blob> {
    console.log('[ApiClientService] exportAttemptsCsv called');
    console.log('[ApiClientService] Intended API endpoint:', `${this.baseUrl}/reports/attempts.csv`);
    const blob = new Blob([], { type: 'text/csv' });
    return of(blob);
  }

  exportInteractionsCsv(): Observable<Blob> {
    console.log('[ApiClientService] exportInteractionsCsv called');
    console.log('[ApiClientService] Intended API endpoint:', `${this.baseUrl}/reports/interactions.csv`);
    const blob = new Blob([], { type: 'text/csv' });
    return of(blob);
  }

  exportXapiCsv(): Observable<Blob> {
    console.log('[ApiClientService] exportXapiCsv called');
    console.log('[ApiClientService] Intended API endpoint:', `${this.baseUrl}/reports/xapi.csv`);
    const blob = new Blob([], { type: 'text/csv' });
    return of(blob);
  }
}
