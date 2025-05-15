const express = require('express');
const router = express.Router();
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

router.post('/identify', upload.single('file'), (req, res) => {
  const filePath = path.join(__dirname, '..', req.file.path);

  const python = spawn('python3', ['predictor.py', filePath]);

  let result = '';

  python.stdout.on('data', (data) => {
    result += data.toString();
  });

  python.stderr.on('data', (data) => {
    console.error('Python error:', data.toString());
  });

  python.on('close', (code) => {
    try {
      const prediction = JSON.parse(result.trim());
      res.json({ prediction });
    } catch (error) {
      console.error('Error parsing prediction:', error);
      res.status(500).send('Error parsing prediction');
    }
  });

  python.on('error', (error) => {
    console.error('Failed to start Python script:', error);
    res.status(500).send('Failed to start Python script');
  });
});

module.exports = router;
