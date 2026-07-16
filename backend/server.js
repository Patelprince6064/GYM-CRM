import express from 'express';
import cors from 'cors';
import { initDB, dbAll, dbRun, dbGet } from './database.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize the database when the server starts
initDB().then(() => {
  console.log('Database initialized successfully');
}).catch(err => {
  console.error('Failed to initialize database', err);
});

// --- Clients Endpoints ---
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await dbAll('SELECT * FROM clients');
    // Convert boolean-like integers to boolean if needed, though SQLite handles 1/0
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  const { name, age, phone, email, avatar, avatarColor, plan, startDate, endDate, remainingDays, currentWeight, goalWeight, height, status, goal, attendance } = req.body;
  try {
    const result = await dbRun(
      `INSERT INTO clients (name, age, phone, email, avatar, avatarColor, plan, startDate, endDate, remainingDays, currentWeight, goalWeight, height, status, goal, attendance) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, age, phone, email, avatar, avatarColor, plan, startDate, endDate, remainingDays, currentWeight, goalWeight, height, status, goal, attendance || 0]
    );
    const newClient = await dbGet('SELECT * FROM clients WHERE id = ?', [result.id]);
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  
  // Construct dynamic SET clause based on provided fields
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = Object.values(data);
  
  try {
    await dbRun(`UPDATE clients SET ${fields} WHERE id = ?`, [...values, id]);
    const updatedClient = await dbGet('SELECT * FROM clients WHERE id = ?', [id]);
    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('DELETE FROM clients WHERE id = ?', [id]);
    res.json({ message: 'Client deleted successfully', id: parseInt(id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Daily Updates Endpoints ---
app.get('/api/daily-updates', async (req, res) => {
  try {
    const updates = await dbAll('SELECT * FROM daily_updates ORDER BY id DESC');
    // Map SQLite boolean (1/0) to JS boolean (true/false)
    const formattedUpdates = updates.map(u => ({ ...u, workout: !!u.workout }));
    res.json(formattedUpdates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/daily-updates', async (req, res) => {
  const { clientId, name, avatar, avatarColor, date, workout, workoutName, water, calories, sleep, steps, mood, notes, heartRate } = req.body;
  try {
    const result = await dbRun(
      `INSERT INTO daily_updates (clientId, name, avatar, avatarColor, date, workout, workoutName, water, calories, sleep, steps, mood, notes, heartRate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clientId, name, avatar, avatarColor, date, workout ? 1 : 0, workoutName, water, calories, sleep, steps, mood, notes, heartRate]
    );
    const newUpdate = await dbGet('SELECT * FROM daily_updates WHERE id = ?', [result.id]);
    res.status(201).json({ ...newUpdate, workout: !!newUpdate.workout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Weight History Endpoints ---
app.get('/api/weight-history', async (req, res) => {
  try {
    const history = await dbAll('SELECT * FROM weight_history ORDER BY id ASC');
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/weight-history', async (req, res) => {
  const { date, weight } = req.body;
  try {
    const result = await dbRun('INSERT INTO weight_history (date, weight) VALUES (?, ?)', [date, weight]);
    const newEntry = await dbGet('SELECT * FROM weight_history WHERE id = ?', [result.id]);
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Weight Table Data Endpoints ---
app.get('/api/weight-table-data', async (req, res) => {
  try {
    const data = await dbAll('SELECT * FROM weight_table_data ORDER BY id DESC');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/weight-table-data', async (req, res) => {
  const { date, weight, change, bmi } = req.body;
  try {
    const result = await dbRun('INSERT INTO weight_table_data (date, weight, change, bmi) VALUES (?, ?, ?, ?)', [date, weight, change, bmi]);
    const newEntry = await dbGet('SELECT * FROM weight_table_data WHERE id = ?', [result.id]);
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Notifications Endpoints ---
app.get('/api/notifications', async (req, res) => {
  try {
    const notifs = await dbAll('SELECT * FROM notifications ORDER BY id DESC');
    const formatted = notifs.map(n => ({ ...n, read: !!n.read }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  const { message, time, type } = req.body;
  try {
    const result = await dbRun('INSERT INTO notifications (message, time, read, type) VALUES (?, ?, ?, ?)', [message, time || 'Just now', 0, type || 'info']);
    const newNotif = await dbGet('SELECT * FROM notifications WHERE id = ?', [result.id]);
    res.status(201).json({ ...newNotif, read: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('UPDATE notifications SET read = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/read-all', async (req, res) => {
  try {
    await dbRun('UPDATE notifications SET read = 1');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Chat Messages Endpoints ---
app.get('/api/chat-messages', async (req, res) => {
  try {
    const messages = await dbAll('SELECT * FROM chat_messages ORDER BY id ASC');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat-messages', async (req, res) => {
  const { text, sender, senderName, timestamp, time } = req.body;
  try {
    const result = await dbRun(
      'INSERT INTO chat_messages (text, sender, senderName, timestamp, time) VALUES (?, ?, ?, ?, ?)',
      [text, sender, senderName, timestamp, time]
    );
    const newMsg = await dbGet('SELECT * FROM chat_messages WHERE id = ?', [result.id]);
    res.status(201).json(newMsg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
