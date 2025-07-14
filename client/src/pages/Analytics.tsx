import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Download,
  Eye,
  Users
} from 'lucide-react';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import AIIntelligence from '@/components/AIIntelligence';
import FriendsComparison from '@/components/FriendsComparison';
import { useAdaptiveColors } from '@/components/ThemeProvider';
import { useAppStore } from '@/stores/useAppStore';

const Analytics: React.FC = () => {
  const adaptiveColors = useAdaptiveColors();
  const { appStoreUser } = useAppStore();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'reports' | 'export' | 'social'>('dashboard');
  const [comparisonPeriod, setComparisonPeriod] = useState<'week' | 'month'>('week');

  return (
    <div className="analytics-page">
      {/* Header personnalisé pour Analytics */}
      <div className="analytics-hero">
        <div 
          className="hero-background"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white',
            padding: '40px 20px',
            textAlign: 'center',
            borderRadius: '0 0 24px 24px',
            marginBottom: '32px'
          }}
        >
          <div className="hero-icon" style={{ fontSize: '3rem', marginBottom: '16px' }}>
            <BarChart3 size={48} />
          </div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            margin: '0 0 8px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Analytics
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            opacity: 0.9,
            margin: 0,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Analysez vos performances et progressez avec intelligence
          </p>
        </div>
      </div>

      <div className="analytics-content">
        {/* Navigation secondaire */}
        <div className="analytics-nav">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
              style={{
                backgroundColor: activeSection === 'dashboard' ? adaptiveColors.accent : 'transparent',
                color: activeSection === 'dashboard' ? 'white' : adaptiveColors.text,
                border: `1px solid ${adaptiveColors.border}`,
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <BarChart3 size={18} />
              Dashboard
            </button>
            
            <button
              className={`nav-tab ${activeSection === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveSection('reports')}
              style={{
                backgroundColor: activeSection === 'reports' ? adaptiveColors.accent : 'transparent',
                color: activeSection === 'reports' ? 'white' : adaptiveColors.text,
                border: `1px solid ${adaptiveColors.border}`,
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <TrendingUp size={18} />
              Rapports
            </button>
            
            <button
              className={`nav-tab ${activeSection === 'export' ? 'active' : ''}`}
              onClick={() => setActiveSection('export')}
              style={{
                backgroundColor: activeSection === 'export' ? adaptiveColors.accent : 'transparent',
                color: activeSection === 'export' ? 'white' : adaptiveColors.text,
                border: `1px solid ${adaptiveColors.border}`,
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Download size={18} />
              Export
            </button>

            <button
              className={`nav-tab ${activeSection === 'social' ? 'active' : ''}`}
              onClick={() => setActiveSection('social')}
              style={{
                backgroundColor: activeSection === 'social' ? adaptiveColors.accent : 'transparent',
                color: activeSection === 'social' ? 'white' : adaptiveColors.text,
                border: `1px solid ${adaptiveColors.border}`,
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Users size={18} />
              Social
            </button>
          </div>
        </div>

        {/* Contenu selon la section active */}
        {activeSection === 'dashboard' && (
          <div className="dashboard-section">
            {/* Dashboard principal */}
            <AnalyticsDashboard />

            {/* Intelligence AI spécifique aux analytics */}
            <AIIntelligence
              pillar="analytics"
              showPredictions={true}
              showCoaching={true}
              showRecommendations={true}
              className="mt-8"
            />
          </div>
        )}

        {activeSection === 'reports' && (
          <div className="reports-section">
            <div className="reports-grid">
              {/* Rapport de consistance */}
              <div 
                className="report-card"
                style={{ 
                  backgroundColor: adaptiveColors.surface,
                  border: `1px solid ${adaptiveColors.border}`,
                  borderRadius: '12px',
                  padding: '24px'
                }}
              >
                <div className="report-header">
                  <div className="report-icon">
                    <Calendar size={24} color="#10b981" />
                  </div>
                  <div>
                    <h3 style={{ color: adaptiveColors.text, margin: '0 0 8px 0' }}>
                      Rapport de Consistance
                    </h3>
                    <p style={{ color: adaptiveColors.textSecondary, margin: 0 }}>
                      Analyse de vos habitudes sur 30 jours
                    </p>
                  </div>
                </div>
                
                <div className="report-stats">
                  <div className="stat-item">
                    <span className="stat-value" style={{ color: '#10b981' }}>85%</span>
                    <span className="stat-label" style={{ color: adaptiveColors.textSecondary }}>
                      Taux de réussite
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value" style={{ color: '#06b6d4' }}>12</span>
                    <span className="stat-label" style={{ color: adaptiveColors.textSecondary }}>
                      Jours consécutifs
                    </span>
                  </div>
                </div>

                <button 
                  className="report-action"
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    width: '100%',
                    marginTop: '16px'
                  }}
                >
                  Voir le rapport détaillé
                </button>
              </div>

              {/* Rapport de progression */}
              <div 
                className="report-card"
                style={{ 
                  backgroundColor: adaptiveColors.surface,
                  border: `1px solid ${adaptiveColors.border}`,
                  borderRadius: '12px',
                  padding: '24px'
                }}
              >
                <div className="report-header">
                  <div className="report-icon">
                    <TrendingUp size={24} color="#f59e0b" />
                  </div>
                  <div>
                    <h3 style={{ color: adaptiveColors.text, margin: '0 0 8px 0' }}>
                      Progression Mensuelle
                    </h3>
                    <p style={{ color: adaptiveColors.textSecondary, margin: 0 }}>
                      Évolution de vos performances
                    </p>
                  </div>
                </div>
                
                <div className="report-stats">
                  <div className="stat-item">
                    <span className="stat-value" style={{ color: '#f59e0b' }}>+23%</span>
                    <span className="stat-label" style={{ color: adaptiveColors.textSecondary }}>
                      Amélioration
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value" style={{ color: '#8b5cf6' }}>4/4</span>
                    <span className="stat-label" style={{ color: adaptiveColors.textSecondary }}>
                      Piliers actifs
                    </span>
                  </div>
                </div>

                <button 
                  className="report-action"
                  style={{
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    width: '100%',
                    marginTop: '16px'
                  }}
                >
                  Télécharger le rapport
                </button>
              </div>

              {/* Rapport comparatif */}
              <div 
                className="report-card"
                style={{ 
                  backgroundColor: adaptiveColors.surface,
                  border: `1px solid ${adaptiveColors.border}`,
                  borderRadius: '12px',
                  padding: '24px'
                }}
              >
                <div className="report-header">
                  <div className="report-icon">
                    <Eye size={24} color="#ef4444" />
                  </div>
                  <div>
                    <h3 style={{ color: adaptiveColors.text, margin: '0 0 8px 0' }}>
                      Analyse Comparative
                    </h3>
                    <p style={{ color: adaptiveColors.textSecondary, margin: 0 }}>
                      Comparaison avec vos objectifs
                    </p>
                  </div>
                </div>
                
                <div className="report-stats">
                  <div className="stat-item">
                    <span className="stat-value" style={{ color: '#ef4444' }}>92%</span>
                    <span className="stat-label" style={{ color: adaptiveColors.textSecondary }}>
                      Objectifs atteints
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value" style={{ color: '#06b6d4' }}>Top 15%</span>
                    <span className="stat-label" style={{ color: adaptiveColors.textSecondary }}>
                      Classement
                    </span>
                  </div>
                </div>

                <button 
                  className="report-action"
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    width: '100%',
                    marginTop: '16px'
                  }}
                >
                  Voir la comparaison
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'export' && (
          <div className="export-section">
            <div 
              className="export-container"
              style={{ 
                backgroundColor: adaptiveColors.surface,
                border: `1px solid ${adaptiveColors.border}`,
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'center'
              }}
            >
              <h3 style={{ color: adaptiveColors.text, marginBottom: '16px' }}>
                Exportation des Données
              </h3>
              <p style={{ color: adaptiveColors.textSecondary, marginBottom: '32px' }}>
                Téléchargez vos données d'analytics dans différents formats
              </p>

              <div className="export-options">
                <div className="export-option">
                  <button
                    style={{
                      backgroundColor: adaptiveColors.accent,
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      width: '100%',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Download size={18} />
                    Export JSON (Complet)
                  </button>
                  <p style={{ color: adaptiveColors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
                    Toutes vos données en format JSON
                  </p>
                </div>

                <div className="export-option">
                  <button
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      width: '100%',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Download size={18} />
                    Export CSV (Tableau)
                  </button>
                  <p style={{ color: adaptiveColors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
                    Format tableur pour Excel/Sheets
                  </p>
                </div>

                <div className="export-option">
                  <button
                    style={{
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      width: '100%',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Download size={18} />
                    Rapport PDF
                  </button>
                  <p style={{ color: adaptiveColors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
                    Rapport formaté prêt à partager
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '32px', padding: '16px', backgroundColor: `${adaptiveColors.accent}15`, borderRadius: '8px' }}>
                <p style={{ color: adaptiveColors.text, margin: 0, fontSize: '0.9rem' }}>
                  💡 Les données exportées incluent vos métriques des 90 derniers jours
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'social' && (
          <div className="social-section">
            <h2 style={{ 
              color: adaptiveColors.text, 
              marginBottom: '24px',
              fontSize: '1.8rem',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Comparaison Sociale
            </h2>

            <p style={{ 
              color: adaptiveColors.textSecondary, 
              marginBottom: '32px',
              textAlign: 'center',
              fontSize: '1rem'
            }}>
              Comparez vos performances avec celles de vos amis
            </p>

            {/* Composant de comparaison avec les amis */}
            <FriendsComparison 
              userId={appStoreUser.id}
              period={comparisonPeriod}
              onPeriodChange={setComparisonPeriod}
            />

            {/* Intelligence AI pour la section sociale */}
            <AIIntelligence
              pillar="social"
              showPredictions={false}
              showCoaching={true}
              showRecommendations={true}
              className="mt-8"
            />
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .analytics-page {
          min-height: 100vh;
          background: ${adaptiveColors.background};
        }

        .analytics-content {
          padding: 0 16px 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .analytics-nav {
          margin-bottom: 32px;
        }

        .nav-tabs {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .report-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .report-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.8rem;
        }

        .export-options {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .nav-tabs {
            justify-content: center;
          }

          .reports-grid {
            grid-template-columns: 1fr;
          }

          .report-stats {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}} />
    </div>
  );
};

export default Analytics;
