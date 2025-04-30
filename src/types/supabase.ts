
// This file contains types for the Supabase database tables that are not in the auto-generated types

export interface SupabaseMembershipPlan {
  id: string;
  name: string;
  duration_months: number;
  amount: number;
  description: string;
  created_at?: string;
}

export interface SupabaseGymMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  join_date: string;
  membership_plan_id: string;
  subscription_end_date: string;
  status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface SupabasePayment {
  id: string;
  member_id: string;
  amount: number;
  date: string;
  method: string;
  status: string;
  notes?: string;
  created_at: string;
}

// Type to extend Supabase database definition with our custom tables
export interface SupabaseTables {
  gym_members: SupabaseGymMember;
  membership_plans: SupabaseMembershipPlan;
  payments: SupabasePayment;
}
