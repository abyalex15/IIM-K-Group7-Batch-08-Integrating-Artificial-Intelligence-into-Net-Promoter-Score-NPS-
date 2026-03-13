const express = require('express');
const cors = require('cors');
const db = require('./database');
require('dotenv').config();
require('./bot'); // Initialize the bot

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/feedback', (req, res) => {
  db.all('SELECT * FROM feedback ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      data: rows
    });
  });
});

app.delete('/api/feedback/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM feedback WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Feedback deleted successfully', changes: this.changes });
  });
});

app.delete('/api/feedback', (req, res) => {
  db.run('DELETE FROM feedback', [], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'All feedback deleted successfully', changes: this.changes });
  });
});

app.get('/api/stats', (req, res) => {
  db.all('SELECT * FROM feedback', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    let promoters = 0;
    let detractors = 0;
    let passives = 0;
    const total = rows.length;

    rows.forEach(r => {
      if (r.nps_category === 'Promoter') promoters++;
      else if (r.nps_category === 'Detractor') detractors++;
      else passives++;
    });

    const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
    
    res.json({
      totalFeedback: total,
      promoters,
      passives,
      detractors,
      npsScore
    });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
