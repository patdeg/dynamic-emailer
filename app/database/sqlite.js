/**
 * @file sqlite.js
 * @description Module for executing queries against SQLite.
 */

const sqlite3 = require('sqlite3').verbose();
const logger = require('../utils/logger');

/**
 * Processes SQLite rows, handling undefined values and converting them to a standard format.
 * @param {Array} rows - The rows returned from the SQLite query.
 * @param {Array} columns - The column names.
 * @returns {Array} - Processed rows with undefined values handled and converted to strings.
 */
function processSQLiteRows(rows, columns) {
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
 * Executes a SQLite SQL query using the all() method and returns a standardized universal format.
 * @param {Object} systemConfig - The system configuration for SQLite.
 * @param {string} query - The SQL query to execute.
 * @returns {Promise<Object>} - The result of the query, including columns, rows, and types.
 */
function querySQLite(systemConfig, query) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(systemConfig.Path, (err) => {
      if (err) {
        logger.error(`SQLite Connection Error: ${err.message}`);
        reject(err);
      }
    });

    logger.info(`Executing SQLite: ${query}`);

    db.all(query, [], (err, rows) => {
      if (err) {
        logger.error(`SQLite Execution Error: ${err.message}`);
        reject(err);
      } else {
        logger.info('Query completed.');

        if (rows.length > 0) {
          // Get the column names from the first row's keys
          const columns = Object.keys(rows[0]);
          const types = columns.map((col) => typeof rows[0][col] === 'number' ? 'FLOAT' : 'STRING'); // Simple type inference
          
          // Process rows to handle undefined values and convert to a universal format
          const processedRows = processSQLiteRows(rows, columns);

          // Return the universal format
          const universalData = {
            columns: columns,
            rows: processedRows,
            types: types,
            query: query // Include the original query for debugging
          };

          resolve(universalData);
        } else {
          // No rows found
          resolve({
            columns: [],
            rows: [],
            types: [],
            query: query
          });
        }
      }
    });

    db.close();
  });
}

module.exports = { querySQLite };


