// app/database/bigquery.js

const { BigQuery } = require('@google-cloud/bigquery');
const logger = require('../utils/logger'); // Ensure logger is correctly configured
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Initialize BigQuery client
const bigquery = new BigQuery({
  projectId: process.env.BIGQUERY_PROJECT_ID,
  keyFilename: process.env.BIGQUERY_KEYFILE, // Ensure this path is correct and absolute
});

/**
 * Executes a BigQuery SQL query using the query() method.
 *
 * @param {string} query - The SQL query to execute.
 * @returns {Promise<Object>} - The result of the query, including fields and rows.
 */
async function queryBigQuery(query) {
  try {
    logger.info(`Executing BigQuery: ${query}`);

    const options = {
      query: query,
      location: 'US', // Adjust as per your dataset's location
      useLegacySql: false, // Ensure Standard SQL is used
    };

    // Execute the query
    const result = await bigquery.query(options);
    logger.info(`Query completed.`);

    // Destructure the result
    const [rows, apiResponse] = result;

    // Initialize fields as empty
    let fields = [];

    // Check if schema is available in the API response
    if (apiResponse && apiResponse.schema && apiResponse.schema.fields) {
      fields = apiResponse.schema.fields;
    } else {
      logger.warn('No schema found in BigQuery apiResponse. Proceeding without schema.');
      // Optionally, infer schema from rows if necessary
      if (rows.length > 0) {
        fields = Object.keys(rows[0]).map((key) => ({
          name: key,
          type: typeof rows[0][key] === 'number' ? 'FLOAT' : 'STRING', // Simplistic type inference
        }));
        logger.info('Inferred schema from first row.');
      }
    }

    return { fields, rows };
  } catch (error) {
    logger.error(`BigQuery Execution Error: ${error.message}`);
    throw error;
  }
}

module.exports = { queryBigQuery };


