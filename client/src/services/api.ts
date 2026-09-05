import type { Transaction } from '@shared/types';
import { supabase } from './supabase';

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
