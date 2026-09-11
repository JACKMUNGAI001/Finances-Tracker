import type { Transaction } from '@shared/types';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type PlanGoal = {
  id: string;
  title: string;
  subtitle: string;
  target: number;
  current: number;
};

export type PlanBudget = {
  id: string;
  name: string;
  spent: number;
  total: number;
  percent: number;
  color: string;
  icon: string;
};

export type UserPlan = { goals: PlanGoal[]; budgets: PlanBudget[] };

export async function fetchUserPlan(): Promise<UserPlan | null> {
  const { data, error } = await supabase
    .from('user_plans')
    .select('goals, budgets')
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    goals: (data.goals ?? []) as PlanGoal[],
    budgets: (data.budgets ?? []) as PlanBudget[],
  };
}

export async function saveUserPlan(plan: UserPlan): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('You must be signed in to save a plan.');

  const { error } = await supabase
    .from('user_plans')
    .upsert({
      user_id: user.id,
      goals: plan.goals,
      budgets: plan.budgets,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase.from('transactions').select('id, description, amount, type, category, date').order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Transaction[];
}

export async function createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
  const { data, error } = await supabase.from('transactions').insert(transaction).select('id, description, amount, type, category, date').single();
  if (error) throw error;
  return data as Transaction;
}

export async function deleteTransaction(id: string | number): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

export async function updateTransaction(
  id: string | number,
  updates: Omit<Partial<Transaction>, 'id'>
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select('id, description, amount, type, category, date')
    .single();
  if (error) throw error;
  return data as Transaction;
}

export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
  if (error instanceof FunctionsHttpError) {
    const response = await error.context.json().catch(() => null) as { error?: string } | null;
    throw new Error(response?.error ?? 'Unable to delete your account. Please try again.');
  }
  if (error) throw error;
}
