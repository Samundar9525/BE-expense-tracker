const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');

// Initialize app and middleware
const app = express();
app.use(bodyParser.json());
app.use(cors());

// PostgreSQL Connection Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ExpenseTracker',
  password: 'admin',
  port: 5432,
});

// API Endpoints

// 1. Read all records
app.get('/api/records', async (req, res) => {
    const monthYearKey = req.query.month_year_key;  // Retrieve the query parameter
    console.log(monthYearKey)
    if (!monthYearKey) {
      return res.status(400).json({ message: 'Month-Year Key is required' });
    }
    try {
      const result = await pool.query(
        'SELECT * FROM dailystockrecord WHERE month_year_key = $1',
        [monthYearKey]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching stock records:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

// 2. Insert a new record
app.post('/api/records', async (req, res) => {
  const {
    month_year_key,
    record_date,
    current_price,
    buy_price,
    sell_price,
    profit_percentage,
    loss_percentage,
    verdict,
  } = req.body;
console.log(month_year_key,
    record_date,
    current_price,
    buy_price,
    sell_price,
    profit_percentage,
    loss_percentage,
    verdict,)

    console.log(req.body)
  try {
    const query = `
      INSERT INTO DailyStockRecord (
        month_year_key, record_date, current_price, buy_price, 
        sell_price, profit_percentage, loss_percentage, verdict
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const values = [
      month_year_key,
      record_date,
      current_price,
      buy_price,
      sell_price,
      profit_percentage,
      loss_percentage,
      verdict,
    ];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting record:', error);
    res.status(500).send('Error inserting record');
  }
});

// 3. Update a record by ID
app.put('/api/records/:id', async (req, res) => {
  const { id } = req.params;
  const {
    month_year_key,
    record_date,
    current_price,
    buy_price,
    sell_price,
    profit_percentage,
    loss_percentage,
    verdict,
  } = req.body;

  try {
    const query = `
      UPDATE DailyStockRecord
      SET 
        month_year_key = $1, 
        record_date = $2,
        current_price = $3,
        buy_price = $4,
        sell_price = $5,
        profit_percentage = $6,
        loss_percentage = $7,
        verdict = $8
      WHERE id = $9 RETURNING *`;
    const values = [
      month_year_key,
      record_date,
      current_price,
      buy_price,
      sell_price,
      profit_percentage,
      loss_percentage,
      verdict,
      id,
    ];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).send('Error updating record');
  }
});

// 4. Delete a record by ID
app.delete('/api/records/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM DailyStockRecord WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).send('Record not found');
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).send('Error deleting record');
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
