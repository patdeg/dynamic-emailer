/**
 * @file sqlite.js
 * @description Module for executing queries against SQLite.
 */

const sqlite3 = require('sqlite3').verbose();
const logger = require('../utils/logger');

/**
 * Processes SQLite rows, handling undefined values.
 * @param {Array} rows - The rows returned from the SQLite query.
 * @returns {Array} - Processed rows with undefined values handled.
 */
function processSQLiteRows(rows) {
  return rows.map((row, rowIndex) => {
    const processedRow = {};

    Object.keys(row).forEach((key) => {
      let value = row[key];

      if (value !== undefined) {
        // Use the value if it's not undefined
        processedRow[key] = value;
      } else {
        // Log an issue if the value is undefined and handle it
        logger.warn(`Undefined value for field '${key}' in row ${rowIndex}.`);
        processedRow[key] = null; // Use null or another default value
      }
    });

    return processedRow;
  });
}

/**
 * Executes a SQLite SQL query using the all() method.
 * @param {string} dbPath - The path to the SQLite database file.
 * @param {string} query - The SQL query to execute.
 * @returns {Promise<Object>} - The result of the query, including fields and processed rows.
 */
function querySQLite(systemConfig, query) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(systemConfig.dbPath, (err) => {
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

        // Process rows to handle undefined values
        const processedRows = processSQLiteRows(rows);

        resolve({ rows: processedRows });
      }
    });

    db.close();
  });
}

module.exports = { querySQLite };
