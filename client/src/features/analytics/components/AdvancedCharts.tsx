import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useAdaptiveColors } from '@/shared/components/ThemeProvider';

interface ChartData {
  labels?: string[];
  datasets?: Array<{
    label: string;
    data: number[];
    color: string;
    pillar: string;
  }>;
}

interface AdvancedChartsProps {
  data: ChartData;
  type: 'line' | 'area' | 'bar' | 'radar' | 'pie';
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  animate?: boolean;
  className?: string;
}

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({
  data,
  type,
  height = 300,
  showLegend = true,
  showGrid = true,
  animate = true,
  className = '',
}) => {
  const adaptiveColors = useAdaptiveColors();

  // Transformation des données pour Recharts
  const transformDataForRecharts = (chartData: ChartData) => {
    if (!chartData.labels || !chartData.datasets) return [];

    return chartData.labels.map((label, index) => {
      const point: any = { name: label };
      chartData.datasets?.forEach(dataset => {
        point[dataset.label] = dataset.data[index] || 0;
      });
      return point;
    });
  };

  const rechartsData = transformDataForRecharts(data);

  // Configuration du tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="custom-tooltip"
          style={{
            background: adaptiveColors.surface,
            border: `1px solid ${adaptiveColors.border}`,
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <p style={{ color: adaptiveColors.text, fontWeight: 'bold', marginBottom: '8px' }}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
              {entry.name}: {entry.value}
              {entry.name === 'Hydratation' && 'L'}
              {entry.name === 'Nutrition' && ' cal'}
              {entry.name === 'Sommeil' && 'h'}
              {entry.name === 'Entraînement' && 'min'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Rendu selon le type de graphique
  const renderChart = () => {
    const colors = data.datasets?.map(d => d.color) || ['#06b6d4', '#10b981', '#8b5cf6', '#ef4444'];

    switch (type) {
      case 'line':
        return (
          <LineChart data={rechartsData}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke={adaptiveColors.border} opacity={0.3} />
            )}
            <XAxis dataKey="name" stroke={adaptiveColors.textSecondary} fontSize={12} />
            <YAxis stroke={adaptiveColors.textSecondary} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {data.datasets?.map(dataset => (
              <Line
                key={dataset.label}
                type="monotone"
                dataKey={dataset.label}
                stroke={dataset.color}
                strokeWidth={3}
                dot={{ fill: dataset.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={animate ? 1000 : 0}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={rechartsData}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke={adaptiveColors.border} opacity={0.3} />
            )}
            <XAxis dataKey="name" stroke={adaptiveColors.textSecondary} fontSize={12} />
            <YAxis stroke={adaptiveColors.textSecondary} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {data.datasets?.map(dataset => (
              <Area
                key={dataset.label}
                type="monotone"
                dataKey={dataset.label}
                stackId="1"
                stroke={dataset.color}
                fill={dataset.color}
                fillOpacity={0.6}
                animationDuration={animate ? 1000 : 0}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={rechartsData}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke={adaptiveColors.border} opacity={0.3} />
            )}
            <XAxis dataKey="name" stroke={adaptiveColors.textSecondary} fontSize={12} />
            <YAxis stroke={adaptiveColors.textSecondary} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {data.datasets?.map(dataset => (
              <Bar
                key={dataset.label}
                dataKey={dataset.label}
                fill={dataset.color}
                radius={[4, 4, 0, 0]}
                animationDuration={animate ? 1000 : 0}
              />
            ))}
          </BarChart>
        );

      case 'radar':
        // Transformation spéciale pour le radar
        const radarData =
          data.datasets?.[0]?.data.map((value, index) => ({
            subject: data.labels?.[index] || `Item ${index}`,
            value: value,
            fullMark: Math.max(...(data.datasets?.[0]?.data || [100])),
          })) || [];

        return (
          <RadarChart data={radarData}>
            <PolarGrid stroke={adaptiveColors.border} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 12, fill: adaptiveColors.textSecondary }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 'dataMax']}
              tick={{ fontSize: 10, fill: adaptiveColors.textSecondary }}
            />
            <Radar
              name="Performance"
              dataKey="value"
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.3}
              strokeWidth={2}
              animationDuration={animate ? 1000 : 0}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        );

      case 'pie':
        // Transformation pour le pie chart
        const pieData =
          data.datasets?.map(dataset => ({
            name: dataset.label,
            value: dataset.data.reduce((a, b) => a + b, 0),
            color: dataset.color,
          })) || [];

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationDuration={animate ? 1000 : 0}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        );

      default:
        return <div>Type de graphique non supporté</div>;
    }
  };

  return (
    <div className={`advanced-charts ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .advanced-charts {
          background: ${adaptiveColors.surface};
          border-radius: 12px;
          padding: 16px;
          border: 1px solid ${adaptiveColors.border};
        }

        .custom-tooltip {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .recharts-legend-wrapper {
          padding-top: 16px !important;
        }

        .recharts-legend-item-text {
          color: ${adaptiveColors.text} !important;
          font-size: 14px !important;
        }

        .recharts-cartesian-axis-tick-value {
          fill: ${adaptiveColors.textSecondary} !important;
        }

        .recharts-polar-angle-axis-tick-value {
          fill: ${adaptiveColors.textSecondary} !important;
        }
      `,
        }}
      />
    </div>
  );
};

export default AdvancedCharts;
