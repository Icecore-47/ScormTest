// src/app/shared/models/content-package.model.ts
export type ContentStandard = 'SCORM_12' | 'SCORM_2004' | 'XAPI' | 'CMI5';

export interface ContentPackage {
  id: string;
  title: string;
  description?: string;
  standard: ContentStandard;
  version?: string;
  manifestPath?: string;
  launchPath: string;
  scormEntryScoId?: string;
}
