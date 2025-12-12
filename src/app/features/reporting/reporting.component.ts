// src/app/features/reporting/reporting.component.ts
import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { LearningAttempt } from '../../shared/models/scorm-attempt.model';
import { ApiClientService } from '../../core/services/api-client.service';

@Component({
  selector: 'lrp-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent implements OnInit {
  attempts: LearningAttempt[] = [];

  constructor(
    private storageService: StorageService,
    private apiClient: ApiClientService
  ) {}

  ngOnInit(): void {
    this.loadAttempts();
  }

  loadAttempts(): void {
    this.attempts = this.storageService.loadAttempts();
  }

  downloadCsv(type: 'attempts' | 'interactions' | 'xapi'): void {
    let observable;
    if (type === 'attempts') {
      observable = this.apiClient.exportAttemptsCsv();
    } else if (type === 'interactions') {
      observable = this.apiClient.exportInteractionsCsv();
    } else {
      observable = this.apiClient.exportXapiCsv();
    }

    observable.subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lrp-${type}-report.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      console.log('[ReportingComponent] CSV download triggered for', type);
    });
  }
}
