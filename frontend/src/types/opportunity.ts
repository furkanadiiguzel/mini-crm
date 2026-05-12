export type OpportunityStage = "NEW" | "QUALIFIED" | "PROPOSAL" | "WON" | "LOST";

export interface Opportunity {
  id: number;
  title: string;
  amount: string;
  stage: OpportunityStage;
  expected_close: string | null;
  customer: number;
  customer_name: string;
  assigned_to: number | null;
}

export interface StageOption {
  value: OpportunityStage | "";
  label: string;
}

export interface StageMeta {
  label: string;
  color: string;
}
