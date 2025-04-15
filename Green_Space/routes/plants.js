// routes/plants.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取某绿地的植物列表
router.get('/plants/:space_id', async (req, res) => {
  const spaceId = req.params.space_id;
  try {
    const [results] = await db.query(`
      SELECT p.plant_id, p.plant_name, p.plant_description, p.plant_watering, p.plant_sunlight, p.plant_pruning
      FROM plants_info p
      JOIN space_plant sp ON p.plant_id = sp.plant_id
      WHERE sp.space_id = ?
      ORDER BY p.plant_name ASC
    `, [spaceId]);
    res.json(results);
  } catch (err) {
    console.error('Error retrieving plants information:', err);
    res.status(500).send('Internal Server Error');
  }
});

// 获取植物详情 + 其他绿地信息
router.get('/plant/:plant_id', async (req, res) => {
  const plantId = req.params.plant_id;
  try {
    const [plantDetails] = await db.query(`SELECT * FROM plants_info WHERE plant_id = ?`, [plantId]);

    if (plantDetails.length === 0) {
      return res.status(404).send('The requested plant was not found');
    }

    const [otherSpaces] = await db.query(`
      SELECT DISTINCT sp.space_id, s.space_name
      FROM space_plant sp
      JOIN space_info s ON sp.space_id = s.space_id
      WHERE sp.plant_id = ? AND sp.space_id != ?
    `, [plantId, plantId]);

    res.json({
      plantDetails: plantDetails[0],
      otherSpaces
    });
  } catch (err) {
    console.error('Error retrieving plants detail:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
