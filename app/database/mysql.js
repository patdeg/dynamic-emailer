/**
 * @file mysql.js
 * @description Module for executing queries against MySQL.
 */

const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

/**
 * Processes MySQL rows, converting undefined values to empty strings and handling types.
 * @param {Array} rows - The rows returned from the MySQL query.
 * @param {Array} columns - The column names.
 * @returns {Array} - Processed rows with undefined values handled.
 */
function processMySQLRows(rows, columns) {
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
 * Executes a MySQL SQL query using the query() method and returns a standardized format.
 * @param {Object} systemConfig - The system configuration for MySQL.
 * @param {string} queryText - The SQL query to execute.
 * @returns {Promise<Object>} - The query result in universal format.
 */
async function queryMySQL(systemConfig, queryText) {
  const connectionConfig = {
    host: systemConfig.Host,
    user: systemConfig.Username,
    password: systemConfig.Password,
    database: systemConfig.Database,
    port: systemConfig.Port || 3306,
    ssl: systemConfig.SSL || false,
  };

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    logger.info('Connected to MySQL.');
    const [rows, fields] = await connection.execute(queryText);
    logger.info('MySQL query executed successfully.');

    if (rows.length > 0) {
      const columns = fields.map(field => field.name);
      const types = fields.map(field => field.type === 246 ? 'FLOAT' : 'STRING'); // Simplistic type inference for MySQL
      const processedRows = processMySQLRows(rows, columns);

      const universalData = {
        columns: columns,
        rows: processedRows,
        types: types,
        query: queryText,
      };

      return universalData;
    } else {
      return {
        columns: [],
        rows: [],
        types: [],
        query: queryText,
      };
    }

  } catch (error) {
    logger.error('MySQL query error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      logger.info('MySQL connection closed.');
    }
  }
}

module.exports = { queryMySQL };


