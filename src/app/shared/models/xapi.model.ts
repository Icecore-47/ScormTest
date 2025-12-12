// src/app/shared/models/xapi.model.ts
export interface XapiActor {
  mbox?: string;
  name?: string;
  account?: {
    homePage: string;
    name: string;
  };
}

export interface XapiVerb {
  id: string;
  display?: Record<string, string>;
}

export interface XapiActivity {
  id: string;
  definition?: {
    name?: Record<string, string>;
    description?: Record<string, string>;
    type?: string;
  };
}

export interface XapiResult {
  score?: {
    scaled?: number;
    raw?: number;
    min?: number;
    max?: number;
  };
  success?: boolean;
  completion?: boolean;
  response?: string;
}

export interface XapiContext {
  contextActivities?: {
    parent?: XapiActivity[];
    grouping?: XapiActivity[];
    category?: XapiActivity[];
  };
  registration?: string;
}

export interface XapiStatement {
  id?: string;
  actor: XapiActor;
  verb: XapiVerb;
  object: XapiActivity;
  result?: XapiResult;
  context?: XapiContext;
  timestamp?: string;
  stored?: string;
}
