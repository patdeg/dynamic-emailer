// app/database/test_bigquery.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const { queryBigQuery } = require('./bigquery');

async function testBigQueryModule() {
  const sqlQuery = `SELECT
    bike_type,
    COUNT(1) AS N
  FROM \`bigquery-public-data.austin_bikeshare.bikeshare_trips\`
  WHERE
    start_time >= '2024-06-01 00:00:00'
  GROUP BY 1
  ORDER BY 2 DESC`;

  try {
    const result = await queryBigQuery(sqlQuery);
    console.log('Query Result:', result);

    if (result.fields) {
      // If schema is available
      result.rows.forEach(row => {
        console.log(`Bike Type: ${row.bike_type}, Count: ${row.N}`);
      });
    } else {
      // If schema isn't available
      result.rows.forEach(row => {
        console.log(`Bike Type: ${row.bike_type}, Count: ${row.N}`);
      });
    }
  } catch (error) {
    console.error('Test BigQuery Module Error:', error);
  }
}

testBigQueryModule();


