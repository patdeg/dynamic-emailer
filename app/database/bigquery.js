const { BigQuery, BigQueryDate } = require('@google-cloud/bigquery');
const logger = require('../utils/logger');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Initialize BigQuery client
const bigquery = new BigQuery({
  projectId: process.env.BIGQUERY_PROJECT_ID,
  keyFilename: process.env.BIGQUERY_KEYFILE,
});


function prepareVegaData(result) {
  return result.rows.map(row => {
    const processedRow = {};

    // Handle all fields dynamically
    result.fields.forEach(field => {
      let value = row[field.name];

      if (value instanceof BigQueryDate) {
        value = value.value;
      } else if (value instanceof Date) {
        value = value.toISOString().split('T')[0];
      } else if (typeof value === 'number') {
        // Leave numbers as-is
      } else {
        value = String(value);
      }

      processedRow[field.name] = value;
    });

    return processedRow;
  });
}

/**
 * Function to convert BigQueryDate to string and handle any potential issues with undefined values.
 *
 * @param {Array} rows - The rows returned from the BigQuery query.
 * @param {Array} fields - The fields (schema) returned from the query.
 * @returns {Array} - Processed rows with BigQueryDate converted to string and other values handled.
 */
function processBigQueryRows(rows, fields) {
  return rows.map((row, rowIndex) => {
    const processedRow = {};

    fields.forEach((field) => {
      const value = row[field.name];

      if (value instanceof BigQueryDate) {
        // Convert BigQueryDate to a string
        processedRow[field.name] = value.value;
      } else if (value !== undefined) {
        // Use the value if it's not undefined
        processedRow[field.name] = value;
      } else {
        // Log an issue if the value is undefined and handle it
        logger.warn(`Undefined value for field '${field.name}' in row ${rowIndex}.`);
        processedRow[field.name] = null; // Use null or another default value
      }
    });

    return processedRow;
  });
}

/**
 * Executes a BigQuery SQL query using the query() method.
 *
 * @param {string} query - The SQL query to execute.
 * @returns {Promise<Object>} - The result of the query, including fields and processed rows.
 */
async function queryBigQuery(query) {
  try {
    logger.info(`Executing BigQuery: ${query}`);

    const options = {
      query: query,
      location: 'US', // Adjust as per your dataset's location
      useLegacySql: false,
    };

    // Execute the query
    const result = await bigquery.query(options);
    logger.info('Query completed.');

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

    // Process rows to convert BigQueryDate to string and handle undefined values
    const processedRows = processBigQueryRows(rows, fields);

    return { fields, rows: processedRows };

  } catch (error) {
    logger.error(`BigQuery Execution Error: ${error.message}`);
    throw error;
  }
}

module.exports = { queryBigQuery };


