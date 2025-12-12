// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScormPlayerComponent } from './features/player/scorm-player.component';
import { ReportingComponent } from './features/reporting/reporting.component';

export const routes: Routes = [
  { path: '', redirectTo: 'player', pathMatch: 'full' },
  { path: 'player', component: ScormPlayerComponent },
  { path: 'reporting', component: ReportingComponent },
  { path: '**', redirectTo: 'player' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
