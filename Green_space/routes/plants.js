// routes/plants.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all plants (no green space specified)
router.get('/plants', async (req, res) => {
  try {
    const [results] = await db.query(`SELECT * FROM plants_info ORDER BY plant_name ASC`);
    res.json(results);
  } catch (err) {
    console.error('Error retrieving all plants:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Get a list of plants in a green space
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

// Get plant details + other green space information
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
