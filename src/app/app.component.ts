// src/app/app.component.ts
import { Component } from '@angular/core';
import { UserService } from './core/services/user.service';

@Component({
  selector: 'lrp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Learning Runtime Platform';

  constructor(public userService: UserService) {}
}
