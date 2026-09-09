const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// GET User Bookings
router.get('/my-bookings', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, booking_date as date, booking_time as time, service, status, created_at
       FROM bookings
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [req.user.userId]
    );
    res.json({ bookings: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create Booking
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { bookingDate, bookingTime, service } = req.body;
    if (!bookingDate || !bookingTime || !service) {
      return res.status(400).json({ error: 'กรุณาเลือกวัน เวลา และประเภทบริการ' });
    }

    const bookingId = 'BK-' + Date.now();
    const result = await pool.query(
      `INSERT INTO bookings (id, user_id, booking_date, booking_time, service, status)
       VALUES ($1, $2, $3, $4, $5, 'รอตรวจสอบ')
       RETURNING id, booking_date as date, booking_time as time, service, status, created_at`,
      [bookingId, req.user.userId, bookingDate, bookingTime, service]
    );

    res.status(201).json({
      message: 'ส่งคำขอจองแล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ',
      booking: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Check-in Status Today
router.get('/checkin-status', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const result = await pool.query(
      'SELECT id FROM checkins WHERE user_id = $1 AND checkin_date = $2',
      [req.user.userId, today]
    );
    res.json({ checkedToday: result.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Perform Daily Check-in
router.post('/checkin', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    await pool.query(
      `INSERT INTO checkins (user_id, checkin_date)
       VALUES ($1, $2)
       ON CONFLICT (user_id, checkin_date) DO NOTHING`,
      [req.user.userId, today]
    );
    res.json({ message: 'บันทึกการเข้าใช้วันนี้เรียบร้อย', checkedToday: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
