// Configuration et validation des variables d'environnement
// MyFitHero V4 - Sécurité renforcée

interface EnvironmentConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_APP_ENV?: string;
  VITE_API_BASE_URL?: string;
  VITE_APP_VERSION?: string;
  VITE_ENABLE_ANALYTICS?: string;
  VITE_SENTRY_DSN?: string;
}

// Variables d'environnement requises
const requiredEnvVars = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;

// Variables optionnelles avec valeurs par défaut
const optionalEnvVars = {
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || '4.0.0',
  VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS || 'false',
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
} as const;

// Validation des variables requises au démarrage
function validateEnvironment(): EnvironmentConfig {
  const missingVars: string[] = [];

  // Vérifier les variables requises
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      missingVars.push(key);
    }
  });

  if (missingVars.length > 0) {
    const errorMessage = `
🚨 ERREUR DE CONFIGURATION 🚨

Variables d'environnement manquantes:
${missingVars.map(var_ => `- ${var_}`).join('\n')}

Veuillez:
1. Copier .env.example vers .env
2. Remplir les valeurs manquantes
3. Redémarrer l'application

Documentation: README.md#configuration
    `.trim();

    throw new Error(errorMessage);
  }

  // Validation du format des URLs
  try {
    new URL(requiredEnvVars.VITE_SUPABASE_URL);
  } catch {
    throw new Error('VITE_SUPABASE_URL doit être une URL valide');
  }

  // Validation de la clé Supabase (format basique)
  if (requiredEnvVars.VITE_SUPABASE_ANON_KEY.length < 32) {
    throw new Error('VITE_SUPABASE_ANON_KEY semble invalide (trop courte)');
  }

  return {
    ...requiredEnvVars,
    ...optionalEnvVars,
  } as EnvironmentConfig;
}

// Configuration validée et exportée
export const env = validateEnvironment();

// Utilitaires pour l'environnement
export const isDevelopment = env.VITE_APP_ENV === 'development';
export const isProduction = env.VITE_APP_ENV === 'production';
export const isStaging = env.VITE_APP_ENV === 'staging';
export const analyticsEnabled = env.VITE_ENABLE_ANALYTICS === 'true';

// Log de configuration (sans exposer les secrets)
if (isDevelopment) {
  console.log('🔧 Configuration MyFitHero:', {
    environment: env.VITE_APP_ENV,
    version: env.VITE_APP_VERSION,
    supabaseConfigured: !!env.VITE_SUPABASE_URL,
    analyticsEnabled,
  });
}

export default env;
