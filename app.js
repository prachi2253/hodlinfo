import express from "express";
import axios from "axios";

import bodyParser from "body-parser";
import pg from "pg";
//import { dirname } from "path";

//const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Database connection using 'pg' module
const pool = new pg.Client({
  user: 'postgres',         // Your pgAdmin user
  host: 'localhost',
  database: 'hodlinfo',   // Your database name
  password: 'prachii25', // Your pgAdmin password
  port: 5432              // Default PostgreSQL port
});
pool.connect();
app.use(bodyParser.urlencoded({ extended: true }));



app.set('view engine', 'ejs');

// Serve static files 
app.use(express.static("public"));
//app.use(express.static(path.join(__dirname, 'public')));

// Fetch top 10 results from WazirX API and store in the PostgreSQL database
app.get("/", async (req, res) => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const tickers = response.data;
    const top10 = Object.values(tickers).slice(0, 10);
    
    // Clear the table before storing new data
    await pool.query('DELETE FROM cryptos');

    
    for (let ticker of top10) {
      const { name, last, buy, sell, volume, base_unit } = ticker;
      await pool.query(
        'INSERT INTO cryptos (name, last, buy, sell, volume, base_unit) VALUES ($1, $2, $3, $4, $5, $6)',
        [name, parseFloat(last), parseFloat(buy), parseFloat(sell), parseFloat(volume), base_unit]
      );
      console.log(ticker.buy);
    }
   
    try {
        const result = await pool.query('SELECT * FROM cryptos');
        const cryptos = result.rows;
        res.render('index.ejs', { cryptos });
      } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
      }
    //res.send('Top 10 crypto data fetched and stored in the database');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching data');
  }
});


// app.get('/', async (req, res) => {
  
// });


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
