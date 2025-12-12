// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { User } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly testUser: User = {
    id: 'test-user-001',
    displayName: 'Test User',
    email: 'test.user@example.com'
  };

  get currentUser(): User {
    return this.testUser;
  }
}
