import type { Transaction, Debt } from '@shared/types';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type PlanGoal = {
  id: string;
  title: string;
  subtitle: string;
  target: number;
  current: number;
  createdAt?: string;
};

export type PlanBudget = {
  id: string;
  name: string;
  spent: number;
  total: number;
  percent: number;
  color: string;
  icon: string;
  createdAt?: string;
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

export async function fetchTransactions(dateRange?: { from?: string; to?: string }): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select('id, description, amount, type, category, date')
    .order('date', { ascending: false });

  if (dateRange?.from) {
    query = query.gte('date', dateRange.from);
  }
  if (dateRange?.to) {
    query = query.lte('date', dateRange.to);
  }

  const { data, error } = await query;
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

export async function fetchDebts(): Promise<Debt[]> {
  const { data, error } = await supabase
    .from('debts')
    .select('id, name, amount, type, person, due_date, description, status, paid_amount, created_at, updated_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    type: row.type as Debt['type'],
    person: row.person,
    dueDate: row.due_date,
    description: row.description,
    status: row.status as Debt['status'],
    paidAmount: Number(row.paid_amount) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })) as Debt[];
}

export async function createDebt(debt: Omit<Debt, 'id'>): Promise<Debt> {
  const { data, error } = await supabase
    .from('debts')
    .insert({
      name: debt.name,
      amount: debt.amount,
      type: debt.type,
      person: debt.person,
      due_date: debt.dueDate,
      description: debt.description,
      status: debt.status,
      paid_amount: debt.paidAmount ?? 0,
      created_at: debt.createdAt,
      updated_at: debt.updatedAt,
    })
    .select('id, name, amount, type, person, due_date, description, status, paid_amount, created_at, updated_at')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    amount: Number(data.amount),
    type: data    .type as Debt['type'],
    person: data.person,
    dueDate: data.due_date,
    description: data.description,
    status: data.status as Debt['status'],
    paidAmount: Number(data.paid_amount) || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  } as Debt;
}

export async function updateDebt(id: string | number, updates: Partial<Omit<Debt, 'id'>>): Promise<Debt> {
  const { data, error } = await supabase
    .from('debts')
    .update({
      ...('name' in updates && { name: updates.name }),
      ...('amount' in updates && { amount: updates.amount }),
      ...('type' in updates && { type: updates.type }),
      ...('person' in updates && { person: updates.person }),
      ...('dueDate' in updates && { due_date: updates.dueDate }),
      ...('description' in updates && { description: updates.description }),
      ...('status' in updates && { status: updates.status }),
      ...('paidAmount' in updates && { paid_amount: updates.paidAmount }),
      ...('createdAt' in updates && { created_at: updates.createdAt }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, name, amount, type, person, due_date, description, status, paid_amount, created_at, updated_at')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    amount: Number(data.amount),
    type: data.type as Debt['type'],
    person: data.person,
    dueDate: data.due_date,
    description: data.description,
    status: data.status as Debt['status'],
    paidAmount: Number(data.paid_amount) || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  } as Debt;
}

export async function deleteDebt(id: string | number): Promise<void> {
  const { error } = await supabase.from('debts').delete().eq('id', id);
  if (error) throw error;
}
