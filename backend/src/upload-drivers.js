const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });

const router = express.Router();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT
});

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Upload endpoint
router.post('/admin/upload-drivers', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    for (let row of data) {
      await pool.query(
        'INSERT INTO drivers (driver_name, license_number, phone_number, route_id) VALUES ($1, $2, $3, $4)',
        [row.driver_name, row.license_number, row.phone_number || null, row.route_id || null]
      );
    }

    res.json({ message: 'Drivers uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload drivers' });
  }
});

module.exports = router;
