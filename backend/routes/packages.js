const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all packages
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM packages ORDER BY price ASC');
    const fitnessPackages = [];
    const trainerPackages = [];

    result.rows.forEach(p => {
      const item = {
        id: p.id,
        label: p.label,
        name: p.name,
        price: Number(p.price),
        unit: p.unit_label,
        featured: p.featured,
        features: p.features || []
      };
      if (p.package_type === 'fitness') fitnessPackages.push(item);
      else trainerPackages.push(item);
    });

    res.json({
      fitnessPackages,
      trainerPackages
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
