export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ApiError = Record<string, string | string[] | undefined>;

export interface DashboardStageRow {
  stage: string;
  count: number;
  total_amount: string;
}

export interface DashboardData {
  total_customers: number;
  new_customers_last_30_days: number;
  won_revenue_this_month: string;
  opportunities_by_stage: DashboardStageRow[];
  recent_customers: import("./customer").CustomerListItem[];
}
