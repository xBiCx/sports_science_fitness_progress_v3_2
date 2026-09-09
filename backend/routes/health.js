const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

function bmiCategory(bmi) {
  if (bmi < 18.5) return 'น้ำหนักต่ำกว่าเกณฑ์';
  if (bmi < 23) return 'สมส่วน';
  if (bmi < 25) return 'น้ำหนักเกิน';
  if (bmi < 30) return 'อ้วนระดับ 1';
  return 'อ้วนระดับ 2';
}

function calculateHealth(data) {
  const weight = Number(data.weight);
  const height = Number(data.height);
  const age = Number(data.age);
  const activity = Number(data.activityLevel || data.activity);
  const bodyFat = data.bodyFat ? Number(data.bodyFat) : null;

  const bmi = weight / ((height / 100) ** 2);
  const bmr = (10 * weight) + (6.25 * height) - (5 * age) + (data.sex === 'male' ? 5 : -161);
  const tdee = bmr * activity;
  const adjustment = data.goal === 'weight-loss' ? -400 : data.goal === 'muscle-gain' ? 250 : 0;
  const targetCalories = Math.max(1200, tdee + adjustment);
  const protein = Math.round(weight * (data.goal === 'muscle-gain' ? 1.8 : 1.5));

  return {
    bmi: Number(bmi.toFixed(1)),
    bmiCategory: bmiCategory(bmi),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    protein,
    bodyFat
  };
}

// GET Health profile for logged in user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM health_profiles WHERE user_id = $1', [req.user.userId]);
    if (result.rows.length === 0) return res.json({ profile: null });
    const row = result.rows[0];
    res.json({
      profile: {
        sex: row.sex,
        age: row.age,
        height: row.height,
        weight: row.weight,
        bodyFat: row.body_fat,
        activityLevel: row.activity_level,
        goal: row.goal,
        experienceLevel: row.experience_level,
        limitations: row.limitations,
        results: {
          bmi: Number(row.bmi),
          bmiCategory: row.bmi_category,
          bmr: row.bmr,
          tdee: row.tdee,
          targetCalories: row.target_calories,
          protein: row.protein_grams,
          bodyFat: row.body_fat
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Save / Update Health Profile
router.post('/me', authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const results = calculateHealth(data);

    const query = `
      INSERT INTO health_profiles (
        user_id, sex, age, height, weight, body_fat, activity_level, goal, experience_level, limitations,
        bmi, bmi_category, bmr, tdee, target_calories, protein_grams, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        sex = EXCLUDED.sex,
        age = EXCLUDED.age,
        height = EXCLUDED.height,
        weight = EXCLUDED.weight,
        body_fat = EXCLUDED.body_fat,
        activity_level = EXCLUDED.activity_level,
        goal = EXCLUDED.goal,
        experience_level = EXCLUDED.experience_level,
        limitations = EXCLUDED.limitations,
        bmi = EXCLUDED.bmi,
        bmi_category = EXCLUDED.bmi_category,
        bmr = EXCLUDED.bmr,
        tdee = EXCLUDED.tdee,
        target_calories = EXCLUDED.target_calories,
        protein_grams = EXCLUDED.protein_grams,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      req.user.userId,
      data.sex,
      Number(data.age),
      Number(data.height),
      Number(data.weight),
      data.bodyFat ? Number(data.bodyFat) : null,
      Number(data.activityLevel || data.activity),
      data.goal,
      data.experienceLevel,
      data.limitations || '',
      results.bmi,
      results.bmiCategory,
      results.bmr,
      results.tdee,
      results.targetCalories,
      results.protein
    ];

    await pool.query(query, values);

    res.json({
      message: 'บันทึกข้อมูลสุขภาพเรียบร้อยแล้ว',
      results
    });
  } catch (err) {
    console.error('Save health profile error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลสุขภาพ' });
  }
});

module.exports = router;
