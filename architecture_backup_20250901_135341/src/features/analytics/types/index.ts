// Types pour la feature Analytics
export interface AnalyticsData {
  period: DateRange;
  metrics: Metric[];
  comparisons: Comparison[];
  trends: Trend[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
}

export interface Comparison {
  metric: string;
  current: number;
  previous: number;
  improvement: number;
}

export interface Trend {
  metric: string;
  data: DataPoint[];
  direction: 'up' | 'down' | 'stable';
}

export interface DataPoint {
  date: Date;
  value: number;
}
