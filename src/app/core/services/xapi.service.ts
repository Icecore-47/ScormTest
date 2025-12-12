// src/app/core/services/xapi.service.ts
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { StorageService } from './storage.service';
import { ApiClientService } from './api-client.service';
import { XapiActor, XapiActivity, XapiStatement, XapiVerb, XapiResult, XapiContext } from '../../shared/models/xapi.model';
import { ContentPackage } from '../../shared/models/content-package.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class XapiService {
  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private apiClient: ApiClientService
  ) {}

  private buildActor(): XapiActor {
    const user = this.userService.currentUser;
    return {
      name: user.displayName,
      mbox: user.email ? `mailto:${user.email}` : undefined,
      account: {
        homePage: 'https://example-lrp.local',
        name: user.id
      }
    };
  }

  private buildActivity(contentPackage: ContentPackage): XapiActivity {
    return {
      id: `https://example-lrp.local/content/${contentPackage.id}`,
      definition: {
        name: { 'en-US': contentPackage.title },
        description: { 'en-US': contentPackage.description ?? '' },
        type: 'http://adlnet.gov/expapi/activities/lesson'
      }
    };
  }

  sendLaunched(contentPackage: ContentPackage, registration?: string): void {
    const verb: XapiVerb = {
      id: 'http://adlnet.gov/expapi/verbs/launched',
      display: { 'en-US': 'launched' }
    };
    const statement = this.buildStatement(verb, contentPackage, undefined, registration);
    this.persistAndSend(statement);
  }

  sendCompleted(contentPackage: ContentPackage, result?: XapiResult, registration?: string): void {
    const verb: XapiVerb = {
      id: 'http://adlnet.gov/expapi/verbs/completed',
      display: { 'en-US': 'completed' }
    };
    const statement = this.buildStatement(verb, contentPackage, result, registration);
    this.persistAndSend(statement);
  }

  sendAnswered(contentPackage: ContentPackage, questionId: string, result: XapiResult, registration?: string): void {
    const verb: XapiVerb = {
      id: 'http://adlnet.gov/expapi/verbs/answered',
      display: { 'en-US': 'answered' }
    };
    const activity: XapiActivity = {
      id: `https://example-lrp.local/content/${contentPackage.id}/question/${encodeURIComponent(questionId)}`
    };
    const statement = this.buildStatementWithCustomObject(verb, activity, result, registration);
    this.persistAndSend(statement);
  }

  private buildStatement(verb: XapiVerb, contentPackage: ContentPackage, result?: XapiResult, registration?: string): XapiStatement {
    const actor = this.buildActor();
    const object = this.buildActivity(contentPackage);
    const context: XapiContext = {
      contextActivities: {
        parent: [
          {
            id: `https://example-lrp.local/content/${contentPackage.id}`
          }
        ]
      },
      registration
    };

    return {
      id: uuidv4(),
      actor,
      verb,
      object,
      result,
      context,
      timestamp: new Date().toISOString()
    };
  }

  private buildStatementWithCustomObject(verb: XapiVerb, object: XapiActivity, result?: XapiResult, registration?: string): XapiStatement {
    const actor = this.buildActor();
    const context: XapiContext = {
      registration
    };

    return {
      id: uuidv4(),
      actor,
      verb,
      object,
      result,
      context,
      timestamp: new Date().toISOString()
    };
  }

  private persistAndSend(statement: XapiStatement): void {
    console.log('[XapiService] Persisting xAPI statement', statement);
    const existing = this.storageService.loadXapiStatements();
    existing.push(statement);
    this.storageService.saveXapiStatements(existing);
    this.apiClient.sendXapiStatements([statement]).subscribe();
  }
}
