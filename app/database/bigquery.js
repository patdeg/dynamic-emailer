/**
 * @file bigquery.js
 * @description Module for executing queries against Google BigQuery.
 */

const { BigQuery, BigQueryDate } = require('@google-cloud/bigquery');
const logger = require('../utils/logger');

/**
 * Processes BigQuery rows, converting BigQueryDate to string and handling undefined values.
 * @param {Array} rows - The rows returned from the BigQuery query.
 * @param {Array} fields - The fields (schema) returned from the query.
 * @returns {Array} - Processed rows with BigQueryDate converted to string and other values handled.
 */
function processBigQueryRows(rows, fields) {
  return rows.map((row, rowIndex) => {
    const processedRow = {};

    fields.forEach((field) => {
      let value = row[field.name];

      if (value instanceof BigQueryDate) {
        // Convert BigQueryDate to a string
        processedRow[field.name] = value.value;
      } else if (value !== undefined) {
        // Use the value if it's not undefined
        processedRow[field.name] = value.toString(); // Convert to string for universal format
      } else {
        // Log an issue if the value is undefined and handle it
        logger.warn(`Undefined value for field '${field.name}' in row ${rowIndex}.`);
        processedRow[field.name] = ""; // Use an empty string to standardize format
      }
    });

    return processedRow;
  });
}

/**
 * Executes a BigQuery SQL query using the query() method.
 * @param {Object} systemConfig - The system configuration for BigQuery.
 * @param {string} query - The SQL query to execute.
 * @returns {Promise<Object>} - The result of the query, including fields and processed rows.
 */
async function queryBigQuery(systemConfig, query) {
  try {
    // Initialize BigQuery client with systemConfig
    const bigquery = new BigQuery({
      projectId: systemConfig.ProjectId,
      keyFilename: systemConfig.KeyFile,
    });

    logger.info(`Executing BigQuery: ${query}`);

    const options = {
      query: query,
      location: systemConfig.Location || 'US', // Use location from systemConfig or default to 'US'
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

    // Create the universal format
    const universalData = {
      columns: fields.map(field => field.name),
      rows: processedRows,
      types: fields.map(field => field.type.toLowerCase()), // Convert field types to lowercase for consistency
      query: query // Include the original query for reference
    };

    return universalData;

  } catch (error) {
    logger.error(`BigQuery Execution Error: ${error.message}`);
    throw error;
  }
}

module.exports = { queryBigQuery };


