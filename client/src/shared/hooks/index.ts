// Shared Hooks - Patterns réutilisables
export { default as useLocalStorage } from './useLocalStorage';
export { default as useDebounce } from './useDebounce';
export { default as useAsync } from './useAsync';
export { default as useSupabase } from './useSupabase';
export { default as useForm } from './useForm';
export { default as useNotifications } from './useNotifications';
export { default as useMobile } from './usemobile';
export { useToast } from './use-toast';

// Named exports
export * from './useAnimations';
export * from './useUnitPreferences';

// Types
export type { UseAsyncReturn } from './useAsync';
export type { UseFormReturn } from './useForm';
export type { UseNotificationsReturn } from './useNotifications';
