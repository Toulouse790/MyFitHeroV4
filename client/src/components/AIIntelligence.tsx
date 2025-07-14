import React, { useState, useEffect } from 'react';
import { aiService, type AIAnalysis, type CoachingResponse, type ContextualRecommendation } from '@/services/aiService';
import { useAppStore } from '@/stores/useAppStore';
import { useAnimateOnMount } from '@/hooks/useAnimations';
import { useAdaptiveColors } from '@/components/ThemeProvider';

interface AIIntelligenceProps {
  pillar?: string;
  showPredictions?: boolean;
  showCoaching?: boolean;
  showRecommendations?: boolean;
  className?: string;
}

const AIIntelligence: React.FC<AIIntelligenceProps> = ({
  pillar = 'general',
  showPredictions = true,
  showCoaching = true,
  showRecommendations = true,
  className = ''
}) => {
  const { appStoreUser } = useAppStore();
  const adaptiveColors = useAdaptiveColors();
  const isAnimated = useAnimateOnMount();

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [coaching, setCoaching] = useState<CoachingResponse | null>(null);
  const [recommendations, setRecommendations] = useState<ContextualRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'insights' | 'coaching' | 'predictions'>('insights');

  useEffect(() => {
    loadAIIntelligence();
  }, [pillar, appStoreUser?.id]);

  const loadAIIntelligence = async () => {
    if (!appStoreUser?.id) return;

    try {
      setLoading(true);
      setError(null);

      const promises: Promise<any>[] = [];

      // Analyse des patterns
      promises.push(aiService.analyzePatterns(pillar, '7d'));

      // Coaching adaptatif si demandé
      if (showCoaching) {
        promises.push(
          aiService.getAdaptiveCoaching(
            { user_id: appStoreUser.id, profile: appStoreUser },
            { current_pillar: pillar, time: new Date().toISOString() },
            'improve_consistency'
          )
        );
      }

      // Recommandations contextuelles si demandées
      if (showRecommendations) {
        promises.push(
          aiService.getContextualRecommendations(
            { 
              time_of_day: new Date().getHours(),
              day_of_week: new Date().getDay(),
              weather: 'sunny', // À connecter à une API météo
              location: 'home'
            },
            appStoreUser
          )
        );
      }

      const results = await Promise.all(promises);
      
      setAiAnalysis(results[0]);
      if (showCoaching && results[1]) setCoaching(results[1]);
      if (showRecommendations && results[2]) setRecommendations(results[2].recommendations || []);

      // Toast de succès simplifié
      console.log('Intelligence AI mise à jour');
    } catch (err) {
      setError('Erreur lors du chargement de l\'intelligence AI');
      console.error('AI Intelligence error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAI = () => {
    loadAIIntelligence();
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#22c55e'; // success
      case 'stable': return '#f59e0b'; // warning
      case 'declining': return '#ef4444'; // error
      default: return adaptiveColors.text;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444'; // error
      case 'medium': return '#f59e0b'; // warning
      case 'low': return '#22c55e'; // success
      default: return adaptiveColors.text;
    }
  };

  if (loading) {
    return (
      <div className={`ai-intelligence loading ${className}`}>
        <div className="ai-loading-spinner">
          <div className="spinner"></div>
          <p>Analyse en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`ai-intelligence error ${className}`}>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleRefreshAI} className="retry-btn">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`ai-intelligence ${isAnimated ? 'animated' : ''} ${className}`}
      style={{ borderColor: adaptiveColors.border }}
    >
      {/* Header avec navigation */}
      <div className="ai-header">
        <div className="ai-title">
          <h3 style={{ color: adaptiveColors.text }}>🧠 Intelligence AI</h3>
          <button 
            onClick={handleRefreshAI}
            className="refresh-btn"
            style={{ color: adaptiveColors.accent }}
          >
            ↻
          </button>
        </div>
        
        <div className="ai-tabs">
          <button
            className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
            style={{ 
              backgroundColor: activeTab === 'insights' ? adaptiveColors.accent : 'transparent',
              color: activeTab === 'insights' ? 'white' : adaptiveColors.text
            }}
          >
            Insights
          </button>
          
          {showCoaching && (
            <button
              className={`tab ${activeTab === 'coaching' ? 'active' : ''}`}
              onClick={() => setActiveTab('coaching')}
              style={{ 
                backgroundColor: activeTab === 'coaching' ? adaptiveColors.accent : 'transparent',
                color: activeTab === 'coaching' ? 'white' : adaptiveColors.text
              }}
            >
              Coaching
            </button>
          )}
          
          {showPredictions && (
            <button
              className={`tab ${activeTab === 'predictions' ? 'active' : ''}`}
              onClick={() => setActiveTab('predictions')}
              style={{ 
                backgroundColor: activeTab === 'predictions' ? adaptiveColors.accent : 'transparent',
                color: activeTab === 'predictions' ? 'white' : adaptiveColors.text
              }}
            >
              Prédictions
            </button>
          )}
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      <div className="ai-content">
        {activeTab === 'insights' && aiAnalysis && (
          <div className="insights-panel">
            <div className="trend-analysis">
              <h4 style={{ color: adaptiveColors.text }}>Analyse de tendance</h4>
              <div className="trend-info">
                <span 
                  className="trend-indicator"
                  style={{ color: getTrendColor(aiAnalysis.trend) }}
                >
                  {aiAnalysis.trend === 'improving' ? '📈' : 
                   aiAnalysis.trend === 'stable' ? '➡️' : '📉'}
                  {aiAnalysis.trend === 'improving' ? 'En progression' :
                   aiAnalysis.trend === 'stable' ? 'Stable' : 'En baisse'}
                </span>
                <span className="confidence">
                  Confiance: {Math.round(aiAnalysis.confidence * 100)}%
                </span>
              </div>
            </div>

            <div className="consistency-score">
              <h4 style={{ color: adaptiveColors.text }}>Score de consistance</h4>
              <div className="score-display">
                <div 
                  className="score-circle"
                  style={{ borderColor: adaptiveColors.accent }}
                >
                  <span style={{ color: adaptiveColors.accent }}>
                    {Math.round(aiAnalysis.consistency_score)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="recommendations-list">
              <h4 style={{ color: adaptiveColors.text }}>Recommandations AI</h4>
              {aiAnalysis.recommendations.map((rec, index) => (
                <div 
                  key={index} 
                  className="recommendation-item"
                  style={{ borderLeft: `3px solid ${adaptiveColors.accent}` }}
                >
                  <p style={{ color: adaptiveColors.text }}>{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'coaching' && coaching && (
          <div className="coaching-panel">
            <div className="coaching-message">
              <div 
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(coaching.priority) }}
              >
                {coaching.priority.toUpperCase()}
              </div>
              <h4 style={{ color: adaptiveColors.text }}>Message personnalisé</h4>
              <p style={{ color: adaptiveColors.text }}>{coaching.message}</p>
            </div>

            <div className="action-items">
              <h4 style={{ color: adaptiveColors.text }}>Actions recommandées</h4>
              {coaching.actions.map((action, index) => (
                <div 
                  key={index} 
                  className="action-item"
                  style={{ backgroundColor: adaptiveColors.surface }}
                >
                  <h5 style={{ color: adaptiveColors.accent }}>{action.title}</h5>
                  <p style={{ color: adaptiveColors.text }}>{action.description}</p>
                  <span className="pillar-tag" style={{ color: adaptiveColors.accent }}>
                    {action.pillar}
                  </span>
                </div>
              ))}
            </div>

            <div className="next-checkin">
              <p style={{ color: adaptiveColors.textSecondary }}>
                Prochain check-in: {new Date(coaching.next_check_in).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="predictions-panel">
            <div className="prediction-cards">
              <div 
                className="prediction-card"
                style={{ backgroundColor: adaptiveColors.surface }}
              >
                <h4 style={{ color: adaptiveColors.text }}>Performance prédite</h4>
                <div className="prediction-chart">
                  <div 
                    className="chart-bar"
                    style={{ backgroundColor: adaptiveColors.accent }}
                  ></div>
                </div>
                <p style={{ color: adaptiveColors.textSecondary }}>
                  +15% d'amélioration attendue cette semaine
                </p>
              </div>

              <div 
                className="prediction-card"
                style={{ backgroundColor: adaptiveColors.surface }}
              >
                <h4 style={{ color: adaptiveColors.text }}>Risques identifiés</h4>
                <div className="risk-indicators">
                  <span className="risk-low">Fatigue: Faible</span>
                  <span className="risk-medium">Motivation: Moyenne</span>
                </div>
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="contextual-recommendations">
                <h4 style={{ color: adaptiveColors.text }}>Recommandations contextuelles</h4>
                {recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className="context-rec"
                    style={{ 
                      backgroundColor: adaptiveColors.surface,
                      borderLeft: `3px solid ${getPriorityColor(rec.priority)}`
                    }}
                  >
                    <h5 style={{ color: adaptiveColors.accent }}>{rec.title}</h5>
                    <p style={{ color: adaptiveColors.text }}>{rec.message}</p>
                    <div className="rec-actions">
                      {rec.actions.map((action, idx) => (
                        <button 
                          key={idx}
                          className="action-btn"
                          style={{ 
                            backgroundColor: adaptiveColors.accent,
                            color: 'white'
                          }}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CSS intégré directement dans le composant */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .ai-intelligence {
          background: ${adaptiveColors.surface};
          border-radius: 12px;
          padding: 20px;
          margin: 16px 0;
          border: 1px solid ${adaptiveColors.border};
          transition: all 0.3s ease;
        }

        .ai-intelligence.animated {
          animation: slideInUp 0.6s ease-out;
        }

        .ai-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .ai-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ai-title h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .refresh-btn {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          transition: transform 0.3s ease;
        }

        .refresh-btn:hover {
          transform: rotate(180deg);
        }

        .ai-tabs {
          display: flex;
          gap: 8px;
        }

        .tab {
          padding: 8px 16px;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .tab:hover {
          opacity: 0.8;
        }

        .ai-content {
          min-height: 200px;
        }

        .prediction-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .prediction-cards {
            grid-template-columns: 1fr;
          }
        }

        .prediction-card {
          padding: 16px;
          border-radius: 8px;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-left: 4px solid ${adaptiveColors.accent};
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />
    </div>
  );
};

export default AIIntelligence;
