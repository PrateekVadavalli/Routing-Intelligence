const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT
});

// Multer config for uploads
const upload = multer({ dest: 'uploads/' });

// Routes
app.get('/', (req, res) => {
  res.send('Routing Intelligence API running');
});

// Get all routes
app.get('/routes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM routes');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Upload students from Excel
app.post('/admin/upload-students', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read the Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Insert into DB
    for (let row of data) {
      const { student_name, roll_number, route_id } = row;
      await pool.query(
        'INSERT INTO students (student_name, roll_number, route_id) VALUES ($1, $2, $3) ON CONFLICT (roll_number) DO NOTHING',
        [student_name, roll_number, route_id || null]
      );
    }

    // Delete temp file
    fs.unlinkSync(req.file.path);

    res.json({ message: 'Students uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing file' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
