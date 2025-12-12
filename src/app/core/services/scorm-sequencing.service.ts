// src/app/core/services/scorm-sequencing.service.ts
import { Injectable } from '@angular/core';
import { ContentPackage } from '../../shared/models/content-package.model';

/**
 * This service is a placeholder for a full SCORM 2004 sequencing and navigation engine.
 * The current implementation provides a clear API surface and logging, and can be
 * extended to fully implement the spec's sequencing rules.
 */
export interface ScoNode {
  id: string;
  launchPath: string;
  title?: string;
  isLeaf: boolean;
}

@Injectable()
export class ScormSequencingService {
  private currentSco?: ScoNode;
  private courseStructure: ScoNode[] = [];

  loadManifestStructure(contentPackage: ContentPackage): void {
    console.log('[ScormSequencingService] loadManifestStructure called for package', contentPackage);
    this.courseStructure = [
      {
        id: contentPackage.scormEntryScoId ?? 'sco-1',
        launchPath: contentPackage.launchPath,
        title: contentPackage.title,
        isLeaf: true
      }
    ];
    this.currentSco = this.courseStructure[0];
  }

  getCurrentSco(): ScoNode | undefined {
    return this.currentSco;
  }

  moveNext(): ScoNode | undefined {
    console.log('[ScormSequencingService] moveNext called');
    if (!this.currentSco || this.courseStructure.length <= 1) {
      return this.currentSco;
    }
    const idx = this.courseStructure.findIndex(s => s.id === this.currentSco!.id);
    if (idx >= 0 && idx < this.courseStructure.length - 1) {
      this.currentSco = this.courseStructure[idx + 1];
    }
    console.log('[ScormSequencingService] moveNext resolved to', this.currentSco);
    return this.currentSco;
  }

  movePrevious(): ScoNode | undefined {
    console.log('[ScormSequencingService] movePrevious called');
    if (!this.currentSco || this.courseStructure.length <= 1) {
      return this.currentSco;
    }
    const idx = this.courseStructure.findIndex(s => s.id === this.currentSco!.id);
    if (idx > 0) {
      this.currentSco = this.courseStructure[idx - 1];
    }
    console.log('[ScormSequencingService] movePrevious resolved to', this.currentSco);
    return this.currentSco;
  }
}
