export type TransactionCategory = 
  | 'Food' 
  | 'Rent' 
  | 'Salary' 
  | 'Entertainment' 
  | 'Transport' 
  | 'Utilities' 
  | 'Shopping' 
  | 'Health' 
  | 'Other';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: string | number;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // ISO string
}

export type DebtType = 'owed' | 'lent';
export type DebtStatus = 'pending' | 'paid';

export interface Debt {
  id?: string | number;
  name: string;
  amount: number;
  type: DebtType;
  person: string;
  dueDate?: string;
  description?: string;
  status: DebtStatus;
  paidAmount?: number;
  createdAt: string;
  updatedAt: string;
}
