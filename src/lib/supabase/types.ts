/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Profile {
  id: string;
  full_name: string | null;
  career_field: 'software' | 'ai_ml' | 'design' | 'marketing' | 'finance' | 'freelance' | 'other' | null;
  monthly_income_vnd: number;
  monthly_expenses_vnd: number;
  total_savings_vnd: number;
  has_emergency_fund: boolean;
  emergency_fund_months: number;
  has_debt: boolean;
  debt_amount_vnd: number;
  has_insurance: boolean;
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive' | null;
  investment_knowledge: 'beginner' | 'intermediate' | 'advanced' | null;
  skills: string[];
  financial_goals: string[];
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AllocationDetail {
  pct: number;
  amount_vnd: number;
  reasoning: string;
}

export interface Allocation {
  id: string;
  user_id: string;
  emergency_fund_pct: number;
  etf_dca_pct: number;
  self_investment_pct: number;
  business_capital_pct: number;
  cash_reserve_pct: number;
  ai_reasoning: string;
  risk_level: 'low' | 'moderate' | 'high';
  is_active: boolean;
  created_at: string;
}

export interface AllocationResponse {
  allocation: {
    emergency_fund: AllocationDetail;
    etf_dca: AllocationDetail;
    self_investment: AllocationDetail;
    business_capital: AllocationDetail;
    cash_reserve: AllocationDetail;
  };
  overall_reasoning: string;
  risk_level: 'low' | 'moderate' | 'high';
  warnings: string[];
  opportunity_cost: string;
}

export interface DCASimulation {
  id: string;
  user_id: string;
  monthly_contribution_vnd: number;
  annual_return_pct: number;
  years: number;
  inflation_pct: number;
  instrument: 'VN30' | 'SP500' | 'custom' | string;
  result_json: Array<{ year: number; contributed: number; nominal: number; real: number }>;
  created_at: string;
}

export interface SideHustleIdea {
  title: string;
  category: 'micro_saas' | 'ai_automation' | 'freelance' | 'consulting' | 'digital_product';
  description: string;
  estimated_monthly_vnd: [number, number]; // [min, max]
  time_to_first_revenue_weeks: number;
  difficulty: 'low' | 'medium' | 'high';
  first_steps: string[];
  tools_needed: string[];
}

export interface SideHustleIdeasSave {
  id: string;
  user_id: string;
  ideas_json: SideHustleIdea[];
  generated_at: string;
}

export interface Checkin {
  id: string;
  user_id: string;
  month: string; // YYYY-MM
  income_actual_vnd: number;
  expenses_actual_vnd: number;
  invested_amount_vnd: number;
  notes: string;
  ai_review: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense' | 'investment';
  category: string;
  amount_vnd: number;
  description: string;
  date: string; // YYYY-MM-DD
  created_at: string;
}

