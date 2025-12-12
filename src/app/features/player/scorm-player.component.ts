// src/app/features/player/scorm-player.component.ts
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ContentPackage } from '../../shared/models/content-package.model';
import { ScormRuntimeService } from '../../core/services/scorm-runtime.service';
import { ScormSequencingService } from '../../core/services/scorm-sequencing.service';
import { XapiService } from '../../core/services/xapi.service';
import { Cmi5Service } from '../../core/services/cmi5.service';

@Component({
  selector: 'lrp-scorm-player',
  templateUrl: './scorm-player.component.html',
  styleUrls: ['./scorm-player.component.scss']
})
export class ScormPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('playerFrame', { static: false }) playerFrame?: ElementRef<HTMLIFrameElement>;

  packages: ContentPackage[] = [
    {
      id: 'demo-scorm-12',
      title: 'Demo SCORM 1.2 Course',
      description: 'Sample SCORM 1.2 package',
      standard: 'SCORM_12',
      version: '1.2',
      manifestPath: 'assets/scorm/demo-scorm-12/imsmanifest.xml',
      launchPath: 'assets/scorm/demo-scorm-12/index.html',
      scormEntryScoId: 'sco-1'
    },
    {
      id: 'demo-scorm-2004',
      title: 'Demo SCORM 2004 Course',
      description: 'Sample SCORM 2004 package',
      standard: 'SCORM_2004',
      version: '2004 3rd Ed',
      manifestPath: 'assets/scorm/demo-scorm-2004/imsmanifest.xml',
      launchPath: 'assets/scorm/demo-scorm-2004/index.html',
      scormEntryScoId: 'sco-1'
    },
    {
      id: 'demo-xapi',
      title: 'Demo xAPI Content',
      description: 'Sample xAPI experience',
      standard: 'XAPI',
      launchPath: 'assets/xapi/demo-xapi/index.html'
    },
    {
      id: 'demo-cmi5',
      title: 'Demo cmi5 AU',
      description: 'Sample cmi5 assignable unit',
      standard: 'CMI5',
      launchPath: 'assets/cmi5/demo-cmi5/index.html'
    }
  ];

  selectedPackage: ContentPackage | null = null;
  isLaunched = false;

  constructor(
    private scormRuntime: ScormRuntimeService,
    private sequencingService: ScormSequencingService,
    private xapiService: XapiService,
    private cmi5Service: Cmi5Service
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  selectPackage(pkg: ContentPackage): void {
    this.selectedPackage = pkg;
    this.isLaunched = false;
  }

  launchSelected(): void {
    if (!this.selectedPackage) {
      return;
    }

    if (this.selectedPackage.standard === 'SCORM_12' || this.selectedPackage.standard === 'SCORM_2004') {
      this.scormRuntime.startAttempt(this.selectedPackage);
      this.sequencingService.loadManifestStructure(this.selectedPackage);
    }

    if (this.selectedPackage.standard === 'XAPI') {
      this.xapiService.sendLaunched(this.selectedPackage);
    }

    if (this.selectedPackage.standard === 'CMI5') {
      this.cmi5Service.startSession(this.selectedPackage);
    }

    this.isLaunched = true;
    const launchUrl = this.selectedPackage.launchPath;
    if (this.playerFrame?.nativeElement) {
      this.playerFrame.nativeElement.src = launchUrl;
    }

    console.log('[ScormPlayerComponent] Launched package', this.selectedPackage);
  }

  reload(): void {
    if (this.playerFrame?.nativeElement) {
      this.playerFrame.nativeElement.src = this.playerFrame.nativeElement.src;
    }
  }
}
