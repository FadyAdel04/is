const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock database
const sensors = [
  { id: 1, type: 'moisture', value: 45, zone: 'A1' },
  { id: 2, type: 'temperature', value: 24, zone: 'B2' },
];

app.get('/api/sensors', (req, res) => {
  res.json(sensors);
});

app.post('/api/irrigation/trigger', (req, res) => {
  const { zone, active } = req.body;
  console.log(`Irrigation in zone ${zone} set to ${active}`);
  res.json({ success: true, message: `Zone ${zone} updated` });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
