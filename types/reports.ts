
export interface ChartDataPoint {
  label: string;
  value: number;
  value2?: number; // For comparison or secondary metric
}

export interface ReportSummary {
  title: string;
  value: string;
  change: number;
  isPositive: boolean;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

export enum ReportPeriod {
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  THIS_MONTH = 'THIS_MONTH',
  LAST_MONTH = 'LAST_MONTH'
}
