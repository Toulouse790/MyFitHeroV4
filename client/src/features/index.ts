// Central exports for all features

// Sleep Feature
export * from './sleep';

// Social Feature
export * from './social';

// Hydration Feature
export * from './hydration';

// Workout Feature
export * from './workout';

// Feature types
export type FeatureName = 'sleep' | 'social' | 'hydration' | 'workout' | 'nutrition' | 'dashboard';

export interface FeatureConfig {
  name: FeatureName;
  enabled: boolean;
  route: string;
  component: React.ComponentType;
  permissions?: string[];
}

export const FEATURES_CONFIG: Record<FeatureName, FeatureConfig> = {
  sleep: {
    name: 'sleep',
    enabled: true,
    route: '/sleep',
    component: require('./sleep/pages/SleepPage').default,
  },
  social: {
    name: 'social',
    enabled: true,
    route: '/social',
    component: require('./social/pages/SocialPage').default,
  },
  hydration: {
    name: 'hydration',
    enabled: true,
    route: '/hydration',
    component: require('./hydration/pages/HydrationPage').default,
  },
  workout: {
    name: 'workout',
    enabled: true,
    route: '/workouts',
    component: require('./workout/pages/WorkoutPage').default,
  },
  nutrition: {
    name: 'nutrition',
    enabled: false, // En développement
    route: '/nutrition',
    component: null as any,
  },
  dashboard: {
    name: 'dashboard',
    enabled: false, // En développement
    route: '/dashboard',
    component: null as any,
  },
};
