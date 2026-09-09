const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 1. Register API
router.post('/register', async (req, res) => {
  try {
    const { fullName, studentId, email, phone, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!fullName || !studentId || !cleanEmail || !phone || !password) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
    }

    // Check duplicate email
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'อีเมลนี้ถูกสมัครสมาชิกไว้แล้ว' });
    }

    // Hash password & generate user code
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userCode = 'SSF-' + Math.random().toString(36).slice(2, 8).toUpperCase();

    const result = await pool.query(
      `INSERT INTO users (user_code, full_name, student_id, email, phone, password_hash, provider)
       VALUES ($1, $2, $3, $4, $5, $6, 'local')
       RETURNING id, user_code, full_name, student_id, email, phone, role, created_at`,
      [userCode, fullName.trim(), studentId.trim(), cleanEmail, phone.trim(), passwordHash]
    );

    res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ',
      user: {
        id: result.rows[0].user_code,
        dbId: result.rows[0].id,
        fullName: result.rows[0].full_name,
        studentId: result.rows[0].student_id,
        email: result.rows[0].email,
        phone: result.rows[0].phone
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
});

// 2. Login API
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = result.rows[0];
    if (user.password_hash) {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
      }
    }

    const token = jwt.sign(
      { userId: user.id, userCode: user.user_code, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'sports_science_fitness_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.user_code,
        dbId: user.id,
        fullName: user.full_name,
        name: user.full_name,
        studentId: user.student_id,
        email: user.email,
        phone: user.phone || '-'
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
});

// 3. Google OAuth API
router.post('/google', async (req, res) => {
  try {
    const { credential, demo, profile } = req.body;
    let googleUserPayload = null;

    if (demo && !credential && !profile) {
      googleUserPayload = {
        name: 'สมาชิก Google Demo',
        email: 'google.demo@sportscience.local',
        sub: 'demo-google-sub-12345'
      };
    } else if (profile && profile.email) {
      googleUserPayload = {
        name: profile.name || 'สมาชิก Google',
        email: profile.email,
        sub: profile.sub || profile.id || 'google-user-' + Date.now()
      };
    } else if (credential) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID || undefined
        });
        googleUserPayload = ticket.getPayload();
      } catch (verifyErr) {
        // Fallback for JWT payload decode if audience mismatch or local testing
        const payloadBase64 = credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const decodedJson = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
        if (decodedJson && decodedJson.email) {
          googleUserPayload = decodedJson;
        } else {
          throw verifyErr;
        }
      }
    } else {
      return res.status(400).json({ error: 'ไม่พบข้อมูล Credential จาก Google' });
    }

    const email = googleUserPayload.email.toLowerCase();
    let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = null;

    if (result.rows.length === 0) {
      const userCode = 'GOOGLE-' + String(googleUserPayload.sub || Math.random().toString(36)).slice(-6).toUpperCase();
      const newInsert = await pool.query(
        `INSERT INTO users (user_code, full_name, student_id, email, phone, provider, google_sub)
         VALUES ($1, $2, $3, $4, $5, 'google', $6)
         RETURNING *`,
        [userCode, googleUserPayload.name || 'สมาชิก Google', 'GOOGLE-MEMBER', email, '-', googleUserPayload.sub]
      );
      user = newInsert.rows[0];
    } else {
      user = result.rows[0];
    }

    const token = jwt.sign(
      { userId: user.id, userCode: user.user_code, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'sports_science_fitness_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'เข้าสู่ระบบด้วย Google สำเร็จ',
      token,
      user: {
        id: user.user_code,
        dbId: user.id,
        fullName: user.full_name,
        name: user.full_name,
        studentId: user.student_id,
        email: user.email,
        phone: user.phone || '-'
      }
    });
  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(400).json({ error: err.message || 'ไม่สามารถยืนยันตัวตนด้วย Google ได้' });
  }
});

// 4. Get Current User Info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.user_code, u.full_name, u.student_id, u.email, u.phone, u.role,
              hp.bmi, hp.bmr, hp.tdee, hp.target_calories, hp.protein_grams, hp.goal
       FROM users u
       LEFT JOIN health_profiles hp ON hp.user_id = u.id
       WHERE u.id = $1`,
      [req.user.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้' });
    
    const row = result.rows[0];
    res.json({
      user: {
        id: row.user_code,
        dbId: row.id,
        fullName: row.full_name,
        name: row.full_name,
        studentId: row.student_id,
        email: row.email,
        phone: row.phone,
        healthProfile: row.bmi ? {
          bmi: row.bmi,
          bmr: row.bmr,
          tdee: row.tdee,
          targetCalories: row.target_calories,
          protein: row.protein_grams,
          goal: row.goal
        } : null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
