const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all trainers with certifications
router.get('/', async (req, res) => {
  try {
    const trainersResult = await pool.query('SELECT * FROM trainers ORDER BY rating DESC');
    const certsResult = await pool.query('SELECT * FROM trainer_certifications');

    const certsMap = {};
    certsResult.rows.forEach(cert => {
      if (!certsMap[cert.trainer_id]) certsMap[cert.trainer_id] = [];
      certsMap[cert.trainer_id].push({
        name: cert.name,
        issuer: cert.issuer,
        credentialId: cert.credential_id,
        status: cert.status
      });
    });

    const trainers = trainersResult.rows.map(t => ({
      id: t.id,
      name: t.name,
      initials: t.initials,
      gender: t.gender,
      role: t.role_title,
      experience: t.experience_years,
      rating: Number(t.rating),
      bio: t.bio,
      color: t.color_theme,
      specialties: t.specialties || [],
      goals: t.goals || [],
      tags: t.tags || [],
      schedule: t.schedule || [],
      certifications: certsMap[t.id] || []
    }));

    res.json({ trainers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single trainer detail
router.get('/:id', async (req, res) => {
  try {
    const tResult = await pool.query('SELECT * FROM trainers WHERE id = $1', [req.params.id]);
    if (tResult.rows.length === 0) return res.status(404).json({ error: 'ไม่พบเทรนเนอร์ที่ระบุ' });

    const certsResult = await pool.query('SELECT * FROM trainer_certifications WHERE trainer_id = $1', [req.params.id]);
    const t = tResult.rows[0];

    res.json({
      trainer: {
        id: t.id,
        name: t.name,
        initials: t.initials,
        gender: t.gender,
        role: t.role_title,
        experience: t.experience_years,
        rating: Number(t.rating),
        bio: t.bio,
        color: t.color_theme,
        specialties: t.specialties || [],
        goals: t.goals || [],
        tags: t.tags || [],
        schedule: t.schedule || [],
        certifications: certsResult.rows.map(c => ({
          name: c.name,
          issuer: c.issuer,
          credentialId: c.credential_id,
          status: c.status
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
