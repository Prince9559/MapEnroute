const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Load environment variables first
dotenv.config();
connectDB();

// Route Imports
const authRoutes = require('./src/routes/authRoutes');
const historyRoutes = require('./src/routes/historyRoutes');
const originalMapRoutes = require('./src/routes/mapRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const tripRoutes = require('./src/routes/tripRoutes');
// Nayi Gemini AI wali map file
const customMapRoutes = require('./src/routes/map'); 

const app = express();

app.use(cors());
app.use(express.json());

// Mount All Routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/maps', originalMapRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/trips', tripRoutes);

// Gemini AI route mount (/api/map/ai-analyze)
app.use('/api/map', customMapRoutes);

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