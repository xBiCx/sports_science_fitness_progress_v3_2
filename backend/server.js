const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const trainerRoutes = require('./routes/trainers');
const packageRoutes = require('./routes/packages');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check endpoint
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Sports Science Fitness Club API is running', timestamp: new Date() });
});

// Start Express Server
app.listen(PORT, async () => {
  console.log(`=================================================`);
  console.log(`🚀 SSF Backend API running on http://localhost:${PORT}`);
  console.log(`=================================================`);

  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Connected successfully to database:', process.env.DB_NAME || 'ssf_db');
    client.release();
  } catch (err) {
    console.error('⚠️ PostgreSQL Connection Error:', err.message);
    console.error('👉 Please make sure PostgreSQL is running and database "ssf_db" is created.');
  }
});
