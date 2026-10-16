const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const historyRoutes = require('./src/routes/historyRoutes');
const mapRoutes = require('./src/routes/mapRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const tripRoutes = require('./src/routes/tripRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Mount All Routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/trips', tripRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MapEnroute Backend is running healthy 🚀',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});