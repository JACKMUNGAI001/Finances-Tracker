import express from 'express';
import cors from 'cors';
import db, { initDb } from './db';
import { Transaction } from '../../shared/types';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/api/transactions', (req, res) => {
  db.all('SELECT * FROM transactions ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/transactions', (req, res) => {
  const { description, amount, type, category, date }: Transaction = req.body;
  
  if (!description || !amount || !type || !category || !date) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const query = `INSERT INTO transactions (description, amount, type, category, date) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [description, amount, type, category, date], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, description, amount, type, category, date });
  });
});

app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM transactions WHERE id = ?', id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Deleted successfully', changes: this.changes });
  });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
