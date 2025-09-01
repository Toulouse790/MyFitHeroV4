import { useState, useCallback } from 'react';
import type { CoachingSession, Message, Recommendation } from '../types';

export const useAICoach = () => {
  const [session, setSession] = useState<CoachingSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    // Ajouter le message de l'utilisateur immédiatement
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Implementation à venir
      console.log('Sending message to AI Coach:', content);
      // const response = await AICoachService.submitQuestion(content, session?.context);
      
      // Simuler une réponse de l'IA (à remplacer par l'appel au service)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Réponse simulée de l\'IA Coach...',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  }, [session]);

  const getRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Implementation à venir
      console.log('Getting AI recommendations...');
      // const recs = await AICoachService.getPersonalizedPlan(userProfile);
      // setRecommendations(recs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des recommandations');
    } finally {
      setLoading(false);
    }
  }, []);

  const startSession = useCallback(async (topic: string, userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Implementation à venir
      console.log('Starting AI coaching session:', { topic, userId });
      // const newSession = await AICoachService.getCoachingSession(userId, topic);
      // setSession(newSession);
      // setMessages(newSession.messages || []);
      // setRecommendations(newSession.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du démarrage de la session');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    setMessages([]);
    setRecommendations([]);
    setError(null);
  }, []);

  return {
    session,
    messages,
    recommendations,
    loading,
    error,
    sendMessage,
    getRecommendations,
    startSession,
    clearSession,
  };
};
