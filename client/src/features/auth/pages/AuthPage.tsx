import React, { useState, useCallback, useEffect, memo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useForm, SubmitHandler, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { toast } from 'sonner';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaFacebook } from 'react-icons/fa';

// Supabase client - remplacer par vos clés publiques réelles
const supabaseUrl = 'https://zfmlzxhxhaezdkzjanbc.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmbWx6eGh4aGFlemRremphbmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NDc4MzIsImV4cCI6MjA2NjMyMzgzMn0.x6GpX8ep6YxVEZQt7pcH0SIWzxhTYcXLnaVmD5IGErw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const trackEvent = (event: string) => {
  if (window.gtag) window.gtag('event', event);
};

// --- Types ---
type PackType = 'nutrition' | 'hydration' | 'sport';

interface FormInputs {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  packs: PackType[];
  nutritionGoal?: string;
  hydrationGoal?: string;
  sportGoal?: string;
}

// --- Zod schemas ---
const packOptions = z.enum(['nutrition', 'hydration', 'sport']);

const schemaStep1 = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Mot de passe minimum 8 caractères')
    .max(50)
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[a-z]/, 'Doit contenir une minuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Doit contenir un caractère spécial'),
});

const schemaStep2 = z.object({
  fullName: z.string().min(2, 'Nom complet requis'),
  phone: z.string().min(10, 'Numéro invalide').max(15).optional().or(z.literal('')),
});

const schemaStep3 = z.object({
  packs: z.array(packOptions).nonempty('Sélectionnez au moins un pack'),
});

const schemaStep4 = z.object({
  nutritionGoal: z.string().optional(),
  hydrationGoal: z.string().optional(),
  sportGoal: z.string().optional(),
});

const combinedSchema = schemaStep1.and(schemaStep2).and(schemaStep3).and(schemaStep4);

// --- Components ---
const Step1: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormInputs>();
  return (
    <div className="space-y-4">
      <label htmlFor="email" className="block font-semibold">
        Email
      </label>
      <input
        id="email"
        type="email"
        {...register('email')}
        className={clsx(
          'w-full px-3 py-2 border rounded-md',
          errors.email ? 'border-red-600' : 'border-gray-300'
        )}
        aria-invalid={!!errors.email}
        aria-describedby="email-error"
      />
      {errors.email && (
        <p id="email-error" className="text-red-600 text-sm">
          {errors.email.message}
        </p>
      )}

      <label htmlFor="password" className="block font-semibold mt-4">
        Mot de passe
      </label>
      <input
        id="password"
        type="password"
        {...register('password')}
        className={clsx(
          'w-full px-3 py-2 border rounded-md',
          errors.password ? 'border-red-600' : 'border-gray-300'
        )}
        aria-invalid={!!errors.password}
        aria-describedby="password-error"
      />
      {errors.password && (
        <p id="password-error" className="text-red-600 text-sm">
          {errors.password.message}
        </p>
      )}
    </div>
  );
};

const Step2: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormInputs>();
  return (
    <div className="space-y-4">
      <label htmlFor="fullName" className="block font-semibold">
        Nom complet
      </label>
      <input
        id="fullName"
        type="text"
        {...register('fullName')}
        className={clsx(
          'w-full px-3 py-2 border rounded-md',
          errors.fullName ? 'border-red-600' : 'border-gray-300'
        )}
        aria-invalid={!!errors.fullName}
        aria-describedby="fullname-error"
      />
      {errors.fullName && (
        <p id="fullname-error" className="text-red-600 text-sm">
          {errors.fullName.message}
        </p>
      )}

      <label htmlFor="phone" className="block font-semibold mt-4">
        Téléphone (optionnel)
      </label>
      <input
        id="phone"
        type="tel"
        {...register('phone')}
        className={clsx(
          'w-full px-3 py-2 border rounded-md',
          errors.phone ? 'border-red-600' : 'border-gray-300'
        )}
        aria-invalid={!!errors.phone}
        aria-describedby="phone-error"
      />
      {errors.phone && (
        <p id="phone-error" className="text-red-600 text-sm">
          {errors.phone.message}
        </p>
      )}
    </div>
  );
};

const Step3: React.FC<{ onSelectPack: (selected: PackType[]) => void }> = ({ onSelectPack }) => {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext<FormInputs>();

  const selectedPacks = watch('packs') || [];

  useEffect(() => {
    onSelectPack(selectedPacks as PackType[]);
  }, [selectedPacks, onSelectPack]);

  return (
    <div className="space-y-4">
      <label className="block font-semibold mb-2">
        Sélectionnez les packs qui vous intéressent
      </label>
      <div className="flex flex-col gap-3">
        {['nutrition', 'hydration', 'sport'].map(pack => (
          <label key={pack} className="cursor-pointer inline-flex items-center space-x-2">
            <input
              type="checkbox"
              value={pack}
              {...register('packs')}
              aria-checked={selectedPacks.includes(pack as PackType)}
            />
            <span>{pack.charAt(0).toUpperCase() + pack.slice(1)}</span>
          </label>
        ))}
      </div>
      {errors.packs && <p className="text-red-600 text-sm">{errors.packs.message}</p>}
    </div>
  );
};

const Step4: React.FC<{ selectedPacks: PackType[] }> = ({ selectedPacks }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormInputs>();

  return (
    <div className="space-y-4">
      {selectedPacks.includes('nutrition') && (
        <>
          <label htmlFor="nutritionGoal" className="block font-semibold">
            Objectif Nutritionnel (ex: prise de masse, sèche...)
          </label>
          <input
            id="nutritionGoal"
            type="text"
            {...register('nutritionGoal')}
            className={clsx(
              'w-full px-3 py-2 border rounded-md',
              errors.nutritionGoal ? 'border-red-600' : 'border-gray-300'
            )}
            aria-invalid={!!errors.nutritionGoal}
          />
          {errors.nutritionGoal && (
            <p className="text-red-600 text-sm">{errors.nutritionGoal.message}</p>
          )}
        </>
      )}
      {selectedPacks.includes('hydration') && (
        <>
          <label htmlFor="hydrationGoal" className="block font-semibold mt-4">
            Objectif Hydratation (ex: 2L/jour)
          </label>
          <input
            id="hydrationGoal"
            type="text"
            {...register('hydrationGoal')}
            className={clsx(
              'w-full px-3 py-2 border rounded-md',
              errors.hydrationGoal ? 'border-red-600' : 'border-gray-300'
            )}
            aria-invalid={!!errors.hydrationGoal}
          />
          {errors.hydrationGoal && (
            <p className="text-red-600 text-sm">{errors.hydrationGoal.message}</p>
          )}
        </>
      )}
      {selectedPacks.includes('sport') && (
        <>
          <label htmlFor="sportGoal" className="block font-semibold mt-4">
            Objectif Sportif (ex: perdre du poids, préparation marathon)
          </label>
          <input
            id="sportGoal"
            type="text"
            {...register('sportGoal')}
            className={clsx(
              'w-full px-3 py-2 border rounded-md',
              errors.sportGoal ? 'border-red-600' : 'border-gray-300'
            )}
            aria-invalid={!!errors.sportGoal}
          />
          {errors.sportGoal && <p className="text-red-600 text-sm">{errors.sportGoal.message}</p>}
        </>
      )}
    </div>
  );
};

const STEPS = [
  'Informations connexion',
  'Infos personnelles',
  'Sélection pack',
  'Objectifs personnalisés',
];

const AuthPage: React.FC = () => {
  const methods = useForm<FormInputs>({
    mode: 'onBlur',
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      phone: '',
      packs: [],
      nutritionGoal: '',
      hydrationGoal: '',
      sportGoal: '',
    },
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPacks, setSelectedPacks] = useState<PackType[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showRecoverPassword, setShowRecoverPassword] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  const onStepNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(x => x + 1);
  };

  const onStepBack = () => {
    if (currentStep > 0) setCurrentStep(x => x - 1);
  };

  const onSubmit: SubmitHandler<FormInputs> = async data => {
    setAuthError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
            packs: data.packs,
            nutritionGoal: data.nutritionGoal,
            hydrationGoal: data.hydrationGoal,
            sportGoal: data.sportGoal,
          },
        },
      });
      if (error) throw error;
      toast.success('Inscription réussie, merci de confirmer votre email.');
      trackEvent('sign_up');
      setCurrentStep(0);
      setUserLoggedIn(true);
    } catch (error: any) {
      setAuthError(error.message);
      toast.error('Erreur inscription : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (email: string, password: string) => {
    setAuthError(null);
    setLoading(true);
    try {
      const { data: _data, error: _error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success('Connexion réussie');
      trackEvent('login');
      setUserLoggedIn(true);
    } catch (error: any) {
      setAuthError(error.message);
      toast.error('Erreur connexion : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRecoverPassword = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoverEmail);
      if (error) throw error;
      toast.success('Email de récupération envoyé');
      setShowRecoverPassword(false);
    } catch (error: any) {
      setAuthError(error.message);
      toast.error('Erreur récupération: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    setLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
      trackEvent('oauth_login_' + provider);
    } catch (error: any) {
      setAuthError(error.message);
      toast.error('Erreur login social : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const LoginForm = () => {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          onLogin(loginEmail, loginPassword);
        }}
        className="space-y-4"
        aria-label="Formulaire de connexion"
      >
        <div>
          <label htmlFor="loginEmail" className="block font-semibold">
            Email
          </label>
          <input
            id="loginEmail"
            type="email"
            value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="loginPassword" className="block font-semibold">
            Mot de passe
          </label>
          <input
            id="loginPassword"
            type="password"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        <button
          type="button"
          onClick={() => setShowRecoverPassword(true)}
          className="mt-2 underline text-blue-600 dark:text-blue-400"
        >
          Mot de passe oublié ?
        </button>
      </form>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1 />;
      case 1:
        return <Step2 />;
      case 2:
        return <Step3 onSelectPack={setSelectedPacks} />;
      case 3:
        return <Step4 selectedPacks={selectedPacks} />;
      default:
        return <Step1 />;
    }
  };

  if (userLoggedIn) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold">Bienvenue sur MyFitHero !</h2>
        <p>Vous êtes connecté.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-md shadow-md"
        aria-live="polite"
      >
        {!showRecoverPassword ? (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">Se connecter / S'inscrire</h1>

            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              aria-label="Formulaire d'inscription multi-étapes"
            >
              <FormProvider {...methods}>{renderStep()}</FormProvider>

              <div className="flex justify-between mt-6">
                {currentStep > 0 ? (
                  <button
                    type="button"
                    onClick={onStepBack}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                  >
                    Précédent
                  </button>
                ) : (
                  <div />
                )}
                {currentStep < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => methods.trigger().then(valid => valid && onStepNext())}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {loading ? 'Inscription...' : "S'inscrire"}
                  </button>
                )}
              </div>
              {authError && <p className="mt-3 text-red-600">{authError}</p>}
            </form>

            <div className="mt-8 text-center">
              <p>Ou connectez-vous avec</p>
              <div className="flex justify-center space-x-4 mt-3">
                <button
                  onClick={() => onSocialLogin('google')}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="Connexion avec Google"
                >
                  <FcGoogle size={32} />
                </button>
                <button
                  onClick={() => onSocialLogin('apple')}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="Connexion avec Apple"
                >
                  <FaApple size={28} />
                </button>
                <button
                  onClick={() => onSocialLogin('facebook')}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="Connexion avec Facebook"
                >
                  <FaFacebook size={28} />
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2 text-center">Vous avez déjà un compte ?</h2>
              <LoginForm />
            </div>
          </>
        ) : (
          <div className="space-y-4" aria-label="Récupération mot de passe">
            <h2 className="text-xl font-semibold mb-4 text-center">Récupération du mot de passe</h2>
            <input
              type="email"
              placeholder="Votre email"
              value={recoverEmail}
              onChange={e => setRecoverEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
              autoComplete="email"
            />
            <button
              onClick={onRecoverPassword}
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien de récupération'}
            </button>
            <button
              onClick={() => {
                setShowRecoverPassword(false);
                setAuthError(null);
              }}
              className="w-full py-2 mt-2 bg-gray-300 dark:bg-gray-700 rounded-md hover:bg-gray-400"
            >
              Retour
            </button>
            {authError && <p className="text-red-600">{authError}</p>}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default memo(AuthPage);
