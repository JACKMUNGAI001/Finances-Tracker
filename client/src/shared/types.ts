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
