import React, { useState, useEffect } from 'react';
import {
  Target,
  Award,
  RefreshCw,
  Download,
  Activity,
  Flame
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useAdaptiveColors } from '@/components/ThemeProvider';
import { useAnimateOnMount } from '@/hooks/useAnimations';
import AdvancedCharts from '@/components/AdvancedCharts';
import {
  analyticsService,
  type AnalyticsData,
  type PillarProgress,
  type PerformanceMetrics,
  type DetailedInsight
} from '@/services/analyticsService';

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = ''
}) => {
  const { appStoreUser } = useAppStore();
  const adaptiveColors = useAdaptiveColors();
  const isAnimated = useAnimateOnMount();

  // États pour les données analytics
  const [multiPillarData, setMultiPillarData] = useState<AnalyticsData | null>(null);
  const [pillarProgress, setPillarProgress] = useState<PillarProgress[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [insights, setInsights] = useState<DetailedInsight[]>([]);
  
  // États de contrôle
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');

  useEffect(() => {
    loadAnalyticsData();
  }, [appStoreUser?.id, selectedPeriod]);

  const loadAnalyticsData = async () => {
    if (!appStoreUser?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Chargement parallèle de toutes les données analytics
      const [multiData, progressData, metricsData, insightsData] = await Promise.all([
        analyticsService.getMultiPillarData(appStoreUser.id, selectedPeriod),
        analyticsService.getPillarProgress(appStoreUser.id),
        analyticsService.getPerformanceMetrics(appStoreUser.id),
        analyticsService.getDetailedInsights(appStoreUser.id)
      ]);

      setMultiPillarData(multiData);
      setPillarProgress(progressData);
      setPerformanceMetrics(metricsData);
      setInsights(insightsData);

    } catch (err) {
      setError('Erreur lors du chargement des analytics');
      console.error('Analytics loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const exportData = {
      period: selectedPeriod,
      pillars: pillarProgress,
      metrics: performanceMetrics,
      insights: insights,
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return adaptiveColors.text;
    }
  };

  if (loading) {
    return (
      <div className={`analytics-dashboard loading ${className}`}>
        <div className="loading-spinner">
          <RefreshCw size={40} className="animate-spin" color={adaptiveColors.accent} />
          <p style={{ color: adaptiveColors.text }}>Analyse des données en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`analytics-dashboard error ${className}`}>
        <div className="error-message">
          <p style={{ color: '#ef4444' }}>{error}</p>
          <button 
            onClick={loadAnalyticsData}
            style={{ 
              backgroundColor: adaptiveColors.accent,
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`analytics-dashboard ${isAnimated ? 'animated' : ''} ${className}`}>
      {/* Header avec contrôles */}
      <div className="analytics-header">
        <div className="header-title">
          <h2 style={{ color: adaptiveColors.text }}>
            📊 Analytics Avancées
          </h2>
          <p style={{ color: adaptiveColors.textSecondary }}>
            Analyse complète de vos performances
          </p>
        </div>

        <div className="header-controls">
          {/* Sélecteur de période */}
          <div className="period-selector">
            {['7d', '30d', '90d'].map(period => (
              <button
                key={period}
                className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(period as '7d' | '30d' | '90d')}
                style={{
                  backgroundColor: selectedPeriod === period ? adaptiveColors.accent : 'transparent',
                  color: selectedPeriod === period ? 'white' : adaptiveColors.text,
                  border: `1px solid ${adaptiveColors.border}`,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {period === '7d' ? '7 jours' : period === '30d' ? '30 jours' : '3 mois'}
              </button>
            ))}
          </div>

          {/* Contrôles d'action */}
          <div className="action-controls">
            <button
              onClick={loadAnalyticsData}
              style={{ 
                background: 'none',
                border: 'none',
                color: adaptiveColors.accent,
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleExportData}
              style={{ 
                background: 'none',
                border: 'none',
                color: adaptiveColors.accent,
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Métriques de performance principales */}
      {performanceMetrics && (
        <div className="metrics-grid">
          <div className="metric-card" style={{ backgroundColor: adaptiveColors.surface }}>
            <div className="metric-icon">
              <Target size={24} color="#10b981" />
            </div>
            <div className="metric-content">
              <h3 style={{ color: adaptiveColors.text }}>Consistance</h3>
              <p className="metric-value" style={{ color: '#10b981' }}>
                {performanceMetrics.consistency_score}%
              </p>
              <p className="metric-change" style={{ color: adaptiveColors.textSecondary }}>
                +{performanceMetrics.improvement_rate}% ce mois
              </p>
            </div>
          </div>

          <div className="metric-card" style={{ backgroundColor: adaptiveColors.surface }}>
            <div className="metric-icon">
              <Flame size={24} color="#f59e0b" />
            </div>
            <div className="metric-content">
              <h3 style={{ color: adaptiveColors.text }}>Streak</h3>
              <p className="metric-value" style={{ color: '#f59e0b' }}>
                {performanceMetrics.streak_days} jours
              </p>
              <p className="metric-change" style={{ color: adaptiveColors.textSecondary }}>
                Meilleur: {performanceMetrics.best_day}
              </p>
            </div>
          </div>

          <div className="metric-card" style={{ backgroundColor: adaptiveColors.surface }}>
            <div className="metric-icon">
              <Activity size={24} color="#06b6d4" />
            </div>
            <div className="metric-content">
              <h3 style={{ color: adaptiveColors.text }}>Activités</h3>
              <p className="metric-value" style={{ color: '#06b6d4' }}>
                {performanceMetrics.total_activities}
              </p>
              <p className="metric-change" style={{ color: adaptiveColors.textSecondary }}>
                {performanceMetrics.weekly_average}/semaine
              </p>
            </div>
          </div>

          <div className="metric-card" style={{ backgroundColor: adaptiveColors.surface }}>
            <div className="metric-icon">
              <Award size={24} color="#8b5cf6" />
            </div>
            <div className="metric-content">
              <h3 style={{ color: adaptiveColors.text }}>Défis</h3>
              <p className="metric-value" style={{ color: '#8b5cf6' }}>
                {performanceMetrics.challenges_completed}
              </p>
              <p className="metric-change" style={{ color: adaptiveColors.textSecondary }}>
                Niveau {performanceMetrics.level_progress}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Graphique principal multi-piliers */}
      {multiPillarData && (
        <div className="main-chart-section">
          <div className="chart-header">
            <h3 style={{ color: adaptiveColors.text }}>Évolution Multi-Piliers</h3>
            <div className="chart-controls">
              {['line', 'area', 'bar'].map(type => (
                <button
                  key={type}
                  className={`chart-type-btn ${chartType === type ? 'active' : ''}`}
                  onClick={() => setChartType(type as 'line' | 'area' | 'bar')}
                  style={{
                    backgroundColor: chartType === type ? adaptiveColors.accent : 'transparent',
                    color: chartType === type ? 'white' : adaptiveColors.text,
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginLeft: '4px'
                  }}
                >
                  {type === 'line' ? '📈' : type === 'area' ? '📊' : '📋'}
                </button>
              ))}
            </div>
          </div>
          
          <AdvancedCharts
            data={multiPillarData}
            type={chartType}
            height={400}
            showLegend={true}
            showGrid={true}
            animate={true}
          />
        </div>
      )}

      {/* Progrès par pilier */}
      <div className="pillars-progress">
        <h3 style={{ color: adaptiveColors.text }}>Progrès par Pilier</h3>
        <div className="pillars-grid">
          {pillarProgress.map((pillar) => (
            <div
              key={pillar.pillar}
              className="pillar-card"
              style={{ backgroundColor: adaptiveColors.surface }}
            >
              <div className="pillar-header">
                <span className="pillar-icon">{pillar.icon}</span>
                <h4 style={{ color: adaptiveColors.text }}>{pillar.pillar}</h4>
                <span 
                  className={`trend-badge ${pillar.trend}`}
                  style={{ 
                    color: pillar.trend === 'up' ? '#10b981' : 
                           pillar.trend === 'down' ? '#ef4444' : '#f59e0b'
                  }}
                >
                  {pillar.trend === 'up' ? '↗️' : pillar.trend === 'down' ? '↘️' : '➡️'}
                  {Math.abs(pillar.trend_percentage)}%
                </span>
              </div>
              
              <div className="progress-section">
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${pillar.progress_percentage}%`,
                      backgroundColor: pillar.color
                    }}
                  ></div>
                </div>
                <div className="progress-text">
                  <span style={{ color: adaptiveColors.text }}>
                    {pillar.current_value} / {pillar.target_value}
                  </span>
                  <span style={{ color: pillar.color, fontWeight: 'bold' }}>
                    {pillar.progress_percentage}%
                  </span>
                </div>
              </div>

              <div className="mini-chart">
                <h5 style={{ color: adaptiveColors.textSecondary }}>7 derniers jours</h5>
                <div className="mini-bars">
                  {pillar.last_7_days.map((value, idx) => (
                    <div
                      key={idx}
                      className="mini-bar"
                      style={{
                        height: `${(value / Math.max(...pillar.last_7_days)) * 100}%`,
                        backgroundColor: pillar.color,
                        opacity: 0.7
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights et recommandations */}
      <div className="insights-section">
        <h3 style={{ color: adaptiveColors.text }}>Insights Intelligents</h3>
        <div className="insights-grid">
          {insights.slice(0, 6).map((insight, index) => (
            <div
              key={index}
              className={`insight-card ${insight.type}`}
              style={{ 
                backgroundColor: adaptiveColors.surface,
                borderLeft: `4px solid ${insight.color}`
              }}
            >
              <div className="insight-header">
                <span className="insight-icon">{insight.icon}</span>
                <span 
                  className="insight-priority"
                  style={{ color: getPriorityColor(insight.priority) }}
                >
                  {insight.priority.toUpperCase()}
                </span>
              </div>
              <h4 style={{ color: adaptiveColors.text }}>{insight.title}</h4>
              <p style={{ color: adaptiveColors.textSecondary }}>{insight.description}</p>
              {insight.action_needed && (
                <button
                  className="insight-action"
                  style={{
                    backgroundColor: insight.color,
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  Agir maintenant
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .analytics-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          animation: ${isAnimated ? 'slideInUp 0.6s ease-out' : 'none'};
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-title h2 {
          margin: 0 0 4px 0;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .header-title p {
          margin: 0;
          font-size: 1rem;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .period-selector {
          display: flex;
          gap: 4px;
        }

        .action-controls {
          display: flex;
          gap: 8px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .metric-card {
          padding: 20px;
          border-radius: 12px;
          border: 1px solid ${adaptiveColors.border};
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .metric-icon {
          flex-shrink: 0;
        }

        .metric-content {
          flex: 1;
        }

        .metric-content h3 {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .metric-value {
          margin: 0 0 4px 0;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .metric-change {
          margin: 0;
          font-size: 0.8rem;
        }

        .main-chart-section {
          margin-bottom: 32px;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .chart-header h3 {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .chart-controls {
          display: flex;
          gap: 4px;
        }

        .pillars-progress {
          margin-bottom: 32px;
        }

        .pillars-progress h3 {
          margin: 0 0 20px 0;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .pillar-card {
          padding: 20px;
          border-radius: 12px;
          border: 1px solid ${adaptiveColors.border};
        }

        .pillar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .pillar-icon {
          font-size: 1.2rem;
        }

        .pillar-header h4 {
          margin: 0;
          flex: 1;
          font-size: 1rem;
          font-weight: 600;
        }

        .trend-badge {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .progress-section {
          margin-bottom: 16px;
        }

        .progress-bar-container {
          width: 100%;
          height: 8px;
          background: ${adaptiveColors.border};
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-bar {
          height: 100%;
          transition: width 1s ease-out;
          border-radius: 4px;
        }

        .progress-text {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }

        .mini-chart {
          margin-top: 16px;
        }

        .mini-chart h5 {
          margin: 0 0 8px 0;
          font-size: 0.8rem;
        }

        .mini-bars {
          display: flex;
          align-items: end;
          gap: 2px;
          height: 40px;
        }

        .mini-bar {
          flex: 1;
          min-height: 4px;
          border-radius: 1px;
          transition: height 0.8s ease-out;
        }

        .insights-section {
          margin-bottom: 32px;
        }

        .insights-section h3 {
          margin: 0 0 20px 0;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .insight-card {
          padding: 16px;
          border-radius: 8px;
          border: 1px solid ${adaptiveColors.border};
        }

        .insight-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .insight-icon {
          font-size: 1.2rem;
        }

        .insight-priority {
          font-size: 0.7rem;
          font-weight: 700;
        }

        .insight-card h4 {
          margin: 0 0 8px 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .insight-card p {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .loading-spinner {
          text-align: center;
          padding: 60px 20px;
        }

        .loading-spinner p {
          margin-top: 16px;
          font-size: 1rem;
        }

        .error-message {
          text-align: center;
          padding: 40px 20px;
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

        @media (max-width: 768px) {
          .analytics-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-controls {
            justify-content: space-between;
          }

          .chart-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .pillars-grid {
            grid-template-columns: 1fr;
          }

          .insights-grid {
            grid-template-columns: 1fr;
          }
        }
      `}} />
    </div>
  );
};

export default AnalyticsDashboard;
