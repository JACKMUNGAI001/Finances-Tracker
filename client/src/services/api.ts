import type { Transaction } from '@shared/types';

// On a phone opened through Vite's network URL, localhost would point to the
// phone itself. Use the same host as the page unless a deployed API is supplied.
const API_BASE = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5001/api`;

export async function fetchTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE}/transactions`);
  if (!res.ok) {
    throw new Error(`Failed to fetch transactions: ${res.statusText}`);
  }
  return res.json();
}

export async function createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to create transaction' }));
    throw new Error(error.error || 'Failed to create transaction');
  }
  return res.json();
}

export async function deleteTransaction(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to delete transaction' }));
    throw new Error(error.error || 'Failed to delete transaction');
  }
}
