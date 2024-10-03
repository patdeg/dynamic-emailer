const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log("Hello World");

// Initialize BigQuery client
const bigquery = new BigQuery({
  projectId: process.env.BIGQUERY_PROJECT_ID,
  keyFilename: process.env.BIGQUERY_KEYFILE, // Path to your keyfile
});

async function queryCurrentDate() {
  // Define the SQL query
  const sqlQuery = 'SELECT CURRENT_DATE() AS today;';
  console.log("Query:",sqlQuery);

  // Options for the query
  const options = {
    query: sqlQuery,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'US',
  };

  try {
    console.log('Running query:', sqlQuery);

    // Run the query as a job
    const [job] = await bigquery.createQueryJob(options);
    console.log(`Job ${job.id} started.`);

    // Wait for the query to finish
    const [rows] = await job.getQueryResults();

    // Process and display the results
    rows.forEach(row => {
      console.log(`Today is: ${row.today}`);
    });
  } catch (error) {
    console.error('ERROR:', error);
  }
}

console.log("Let's start...");

// Execute the function
queryCurrentDate();

