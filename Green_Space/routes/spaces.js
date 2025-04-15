// routes/spaces.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 所有绿地
router.get('/spaces', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM space_info ORDER BY space_name ASC');
    res.json(results);
  } catch (err) {
    console.error('Error retrieving green space information:', err);
    res.status(500).send('Internal Server Error');
  }
});

// 单个绿地
router.get('/spaces/:space_id', async (req, res) => {
  const spaceId = req.params.space_id;
  try {
    const [results] = await db.query(`
      SELECT * FROM space_info WHERE space_id = ?
    `, [spaceId]);

    if (results.length === 0) {
      res.status(404).send('The requested space was not found');
    } else {
      res.json(results[0]);
    }
  } catch (err) {
    console.error('Error retrieving green space information:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
