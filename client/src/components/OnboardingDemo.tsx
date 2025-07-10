// client/src/components/OnboardingDemo.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RefreshCw, Settings, User, Database } from 'lucide-react';
import ConversationalOnboarding from './ConversationalOnboarding';
import { OnboardingData } from '@/types/conversationalOnboarding';

interface OnboardingDemoProps {
  user?: any;
}

export default function OnboardingDemo({ user }: OnboardingDemoProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [completedData, setCompletedData] = useState<OnboardingData | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  const handleComplete = (data: OnboardingData) => {
    setCompletedData(data);
    setShowOnboarding(false);
    console.log('Onboarding completed:', data);
  };

  const handleReset = () => {
    setCompletedData(null);
    setShowOnboarding(false);
  };

  const startOnboarding = () => {
    setShowOnboarding(true);
    setCompletedData(null);
  };

  if (showOnboarding) {
    return (
      <ConversationalOnboarding
        onComplete={handleComplete}
        onSkip={() => setShowOnboarding(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MyFitHero V4</h1>
              <p className="text-gray-600">Démonstration de l'onboarding conversationnel</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Demo
              </Badge>
              {user && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <User className="h-3 w-3 mr-1" />
                  Connecté
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Onboarding Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Statut Onboarding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Complété</span>
                  <Badge variant={completedData ? "default" : "secondary"}>
                    {completedData ? "Oui" : "Non"}
                  </Badge>
                </div>
                {completedData && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Modules</span>
                      <Badge variant="outline">
                        {completedData.selectedModules?.length || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Étapes</span>
                      <Badge variant="outline">
                        {completedData.progress.completedSteps.length}/{completedData.progress.totalSteps}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2 text-green-600" />
                Informations Utilisateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedData ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Prénom</span>
                      <span className="text-sm font-medium">{completedData.firstName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Âge</span>
                      <span className="text-sm font-medium">{completedData.age || 'N/A'} ans</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Objectif</span>
                      <Badge variant="outline" className="text-xs">
                        {completedData.mainObjective || 'N/A'}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Aucune donnée disponible</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Database className="h-5 w-5 mr-2 text-purple-600" />
                Système
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Supabase</span>
                  <Badge variant="default" className="bg-green-500">
                    Connecté
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sports API</span>
                  <Badge variant="default" className="bg-blue-500">
                    Actif
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Debug</span>
                  <Badge variant={debugMode ? "default" : "secondary"}>
                    {debugMode ? "ON" : "OFF"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={startOnboarding}
                className="flex items-center"
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Démarrer l'onboarding
              </Button>
              
              {completedData && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              )}
              
              <Button
                onClick={() => setDebugMode(!debugMode)}
                variant="ghost"
                className="flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                {debugMode ? 'Désactiver' : 'Activer'} debug
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {completedData && (
          <Card>
            <CardHeader>
              <CardTitle>Résultats de l'onboarding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Modules sélectionnés */}
                <div>
                  <h3 className="font-semibold mb-3">Modules sélectionnés</h3>
                  <div className="flex flex-wrap gap-2">
                    {completedData.selectedModules?.map((module) => (
                      <Badge key={module} variant="outline" className="bg-blue-50 text-blue-700">
                        {module}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Informations spécifiques */}
                {completedData.sport && (
                  <div>
                    <h3 className="font-semibold mb-3">Sport</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p><strong>Sport:</strong> {completedData.sport}</p>
                      {completedData.sportPosition && (
                        <p><strong>Position:</strong> {completedData.sportPosition}</p>
                      )}
                      {completedData.sportLevel && (
                        <p><strong>Niveau:</strong> {completedData.sportLevel}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Données brutes (debug) */}
                {debugMode && (
                  <div>
                    <h3 className="font-semibold mb-3">Données brutes (Debug)</h3>
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
                      {JSON.stringify(completedData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
