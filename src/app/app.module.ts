import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routes';
import { ScormPlayerComponent } from './features/player/scorm-player.component';
import { ReportingComponent } from './features/reporting/reporting.component';

@NgModule({
  declarations: [AppComponent, ScormPlayerComponent, ReportingComponent],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
