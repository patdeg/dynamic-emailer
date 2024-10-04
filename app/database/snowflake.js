/**
 * @file snowflake.js
 * @description Module for executing queries against Snowflake.
 */

const snowflake = require('snowflake-sdk');
const logger = require('../utils/logger');

/**
 * Processes Snowflake rows, converting undefined values to empty strings and handling types.
 * @param {Array} rows - The rows returned from the Snowflake query.
 * @param {Array} columns - The column names.
 * @returns {Array} - Processed rows with undefined values handled.
 */
function processSnowflakeRows(rows, columns) {
  return rows.map((row, rowIndex) => {
    const processedRow = {};

    columns.forEach((column) => {
      let value = row[column];

      if (value !== undefined) {
        processedRow[column] = value.toString(); // Convert to string for universal format
      } else {
        logger.warn(`Undefined value for field '${column}' in row ${rowIndex}.`);
        processedRow[column] = ""; // Use an empty string to standardize format
      }
    });

    return processedRow;
  });
}

/**
 * Executes a Snowflake SQL query using the execute() method and returns a standardized format.
 * @param {Object} systemConfig - The system configuration for Snowflake.
 * @param {string} queryText - The SQL query to execute.
 * @returns {Promise<Object>} - The query result in universal format.
 */
async function querySnowflake(systemConfig, queryText) {
  let connection;
  try {
    connection = await snowflake.createConnection(systemConfig);
    logger.info('Connected to Snowflake.');

    return new Promise((resolve, reject) => {
      connection.execute({
        sqlText: queryText,
        complete: (err, stmt, rows) => {
          if (err) {
            logger.error('Snowflake query error:', err.message);
            reject(err);
          } else {
            logger.info('Snowflake query executed successfully.');

            if (rows.length > 0) {
              const columns = Object.keys(rows[0]);
              const types = columns.map((col) => typeof rows[0][col] === 'number' ? 'FLOAT' : 'STRING');
              const processedRows = processSnowflakeRows(rows, columns);

              const universalData = {
                columns: columns,
                rows: processedRows,
                types: types,
                query: queryText,
              };

              resolve(universalData);
            } else {
              resolve({
                columns: [],
                rows: [],
                types: [],
                query: queryText,
              });
            }
          }
        },
      });
    });

  } catch (error) {
    logger.error('Snowflake query error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.destroy();
      logger.info('Snowflake connection closed.');
    }
  }
}

module.exports = { querySnowflake };


