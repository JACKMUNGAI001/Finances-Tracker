import express from 'express';
import cors from 'cors';
import db, { initDb } from './db.js';
import type { Transaction } from '../../shared/types.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL?.split(',') || false 
    : true,
  credentials: true,
}));

app.use(express.json());

app.get('/api/transactions', (req, res) => {
  db.all('SELECT * FROM transactions ORDER BY date DESC', [], (err: Error | null, rows: unknown) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/transactions', (req, res) => {
  const { description, amount, type, category, date }: Transaction = req.body;

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    res.status(400).json({ error: 'Description is required' });
    return;
  }

  if (typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
    res.status(400).json({ error: 'Amount must be a positive number' });
    return;
  }

  if (!type || !['income', 'expense'].includes(type)) {
    res.status(400).json({ error: 'Type must be either income or expense' });
    return;
  }

  if (!category || typeof category !== 'string') {
    res.status(400).json({ error: 'Category is required' });
    return;
  }

  if (!date || typeof date !== 'string') {
    res.status(400).json({ error: 'Date is required' });
    return;
  }

  const query = `INSERT INTO transactions (description, amount, type, category, date) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [description.trim(), amount, type, category, date], function(err: Error | null) {
    if (err) {
      res.status(500).json({ error: 'Failed to create transaction' });
      return;
    }
    res.status(201).json({ id: this.lastID, description: description.trim(), amount, type, category, date });
  });
});

app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(Number(id))) {
    res.status(400).json({ error: 'Invalid transaction ID' });
    return;
  }

  db.run('DELETE FROM transactions WHERE id = ?', id, function(err: Error | null) {
    if (err) {
      res.status(500).json({ error: 'Failed to delete transaction' });
      return;
    }
    res.json({ message: 'Deleted successfully', changes: this.changes });
  });
});

app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    res.status(400).json({ error: 'Invalid transaction ID' });
    return;
  }

  const { description, amount, type, category, date }: Partial<Transaction> = req.body;

  const fields: string[] = [];
  const values: unknown[] = [];

  if (description !== undefined) {
    if (typeof description !== 'string' || !description.trim()) {
      res.status(400).json({ error: 'Description must be a non-empty string' });
      return;
    }
    fields.push(`description = ?`);
    values.push(description.trim());
  }

  if (amount !== undefined) {
    if (typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
      res.status(400).json({ error: 'Amount must be a positive number' });
      return;
    }
    fields.push(`amount = ?`);
    values.push(amount);
  }

  if (type !== undefined) {
    if (!['income', 'expense'].includes(type)) {
      res.status(400).json({ error: 'Type must be either income or expense' });
      return;
    }
    fields.push(`type = ?`);
    values.push(type);
  }

  if (category !== undefined) {
    if (typeof category !== 'string') {
      res.status(400).json({ error: 'Category is required' });
      return;
    }
    fields.push(`category = ?`);
    values.push(category);
  }

  if (date !== undefined) {
    if (typeof date !== 'string') {
      res.status(400).json({ error: 'Date is required' });
      return;
    }
    fields.push(`date = ?`);
    values.push(date);
  }

  if (fields.length === 0) {
    res.status(400).json({ error: 'No valid fields to update' });
    return;
  }

  const query = `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`;
  values.push(Number(id));

  db.run(query, values, function(err: Error | null) {
    if (err) {
      res.status(500).json({ error: 'Failed to update transaction' });
      return;
    }
    res.json({ message: 'Updated successfully', changes: this.changes });
  });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err: Error) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
