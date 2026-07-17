import express from 'express';
import cors from 'cors';
import { initDB, dbAll, dbRun, dbGet } from './database.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - allow all origins (you can restrict to your Vercel domain later)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize the database then start server
const startServer = async () => {
  try {
    await initDB();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Failed to initialize database', err);
    process.exit(1);
  }

  // Health check endpoint (useful for Render)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- Clients Endpoints ---
  app.get('/api/clients', (req, res) => {
    try {
      const clients = dbAll('SELECT * FROM clients');
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/clients', (req, res) => {
    const { name, age, phone, email, avatar, avatarColor, plan, startDate, endDate, remainingDays, currentWeight, goalWeight, height, status, goal, attendance } = req.body;
    try {
      const result = dbRun(
        `INSERT INTO clients (name, age, phone, email, avatar, avatarColor, plan, startDate, endDate, remainingDays, currentWeight, goalWeight, height, status, goal, attendance) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, age, phone, email, avatar, avatarColor, plan, startDate, endDate, remainingDays, currentWeight, goalWeight, height, status, goal, attendance || 0]
      );
      const newClient = dbGet('SELECT * FROM clients WHERE id = ?', [result.id]);
      res.status(201).json(newClient);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    try {
      dbRun(`UPDATE clients SET ${fields} WHERE id = ?`, [...values, id]);
      const updatedClient = dbGet('SELECT * FROM clients WHERE id = ?', [id]);
      res.json(updatedClient);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    try {
      dbRun('DELETE FROM clients WHERE id = ?', [id]);
      res.json({ message: 'Client deleted successfully', id: parseInt(id) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Daily Updates Endpoints ---
  app.get('/api/daily-updates', (req, res) => {
    try {
      const updates = dbAll('SELECT * FROM daily_updates ORDER BY id DESC');
      const formattedUpdates = updates.map(u => ({ ...u, workout: !!u.workout }));
      res.json(formattedUpdates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/daily-updates', (req, res) => {
    const { clientId, name, avatar, avatarColor, date, workout, workoutName, water, calories, sleep, steps, mood, notes, heartRate } = req.body;
    try {
      const result = dbRun(
        `INSERT INTO daily_updates (clientId, name, avatar, avatarColor, date, workout, workoutName, water, calories, sleep, steps, mood, notes, heartRate)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [clientId, name, avatar, avatarColor, date, workout ? 1 : 0, workoutName, water, calories, sleep, steps, mood, notes, heartRate]
      );
      const newUpdate = dbGet('SELECT * FROM daily_updates WHERE id = ?', [result.id]);
      res.status(201).json({ ...newUpdate, workout: !!newUpdate.workout });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Weight History Endpoints ---
  app.get('/api/weight-history', (req, res) => {
    try {
      const history = dbAll('SELECT * FROM weight_history ORDER BY id ASC');
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/weight-history', (req, res) => {
    const { date, weight } = req.body;
    try {
      const result = dbRun('INSERT INTO weight_history (date, weight) VALUES (?, ?)', [date, weight]);
      const newEntry = dbGet('SELECT * FROM weight_history WHERE id = ?', [result.id]);
      res.status(201).json(newEntry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Weight Table Data Endpoints ---
  app.get('/api/weight-table-data', (req, res) => {
    try {
      const data = dbAll('SELECT * FROM weight_table_data ORDER BY id DESC');
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/weight-table-data', (req, res) => {
    const { date, weight, change, bmi } = req.body;
    try {
      const result = dbRun('INSERT INTO weight_table_data (date, weight, change, bmi) VALUES (?, ?, ?, ?)', [date, weight, change, bmi]);
      const newEntry = dbGet('SELECT * FROM weight_table_data WHERE id = ?', [result.id]);
      res.status(201).json(newEntry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Notifications Endpoints ---
  app.get('/api/notifications', (req, res) => {
    try {
      const notifs = dbAll('SELECT * FROM notifications ORDER BY id DESC');
      const formatted = notifs.map(n => ({ ...n, read: !!n.read }));
      res.json(formatted);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/notifications', (req, res) => {
    const { message, time, type } = req.body;
    try {
      const result = dbRun('INSERT INTO notifications (message, time, read, type) VALUES (?, ?, ?, ?)', [message, time || 'Just now', 0, type || 'info']);
      const newNotif = dbGet('SELECT * FROM notifications WHERE id = ?', [result.id]);
      res.status(201).json({ ...newNotif, read: false });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    const { id } = req.params;
    try {
      dbRun('UPDATE notifications SET read = 1 WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/notifications/read-all', (req, res) => {
    try {
      dbRun('UPDATE notifications SET read = 1');
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Chat Messages Endpoints ---
  app.get('/api/chat-messages', (req, res) => {
    try {
      const messages = dbAll('SELECT * FROM chat_messages ORDER BY id ASC');
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/chat-messages', (req, res) => {
    const { text, sender, senderName, timestamp, time } = req.body;
    try {
      const result = dbRun(
        'INSERT INTO chat_messages (text, sender, senderName, timestamp, time) VALUES (?, ?, ?, ?, ?)',
        [text, sender, senderName, timestamp, time]
      );
      const newMsg = dbGet('SELECT * FROM chat_messages WHERE id = ?', [result.id]);
      res.status(201).json(newMsg);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
