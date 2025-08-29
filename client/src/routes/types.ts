// types/routes.ts
import { ComponentType } from 'react';

export interface RouteConfig {
  path: string;
  component: ComponentType;
  isProtected?: boolean;
  requiredRoles?: string[];
  metadata?: {
    title?: string;
    description?: string;
    icon?: string;
    category?: RouteCategory;
  };
}

export type RouteCategory =
  | 'auth'
  | 'dashboard'
  | 'fitness'
  | 'wellness'
  | 'social'
  | 'settings'
  | 'admin'
  | 'legal';

export interface RouteGroup {
  category: RouteCategory;
  routes: RouteConfig[];
}
