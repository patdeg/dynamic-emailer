/**
 * @file sqlserver.js
 * @description Module for executing queries against SQL Server.
 */

const sql = require('mssql');
const logger = require('../utils/logger');

/**
 * Processes SQL Server rows, converting undefined values to empty strings and handling types.
 * @param {Array} rows - The rows returned from the SQL Server query.
 * @param {Array} columns - The column names.
 * @returns {Array} - Processed rows with undefined values handled.
 */
function processSqlServerRows(rows, columns) {
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
 * Executes a SQL Server SQL query using the query() method and returns a standardized format.
 * @param {Object} systemConfig - The system configuration for SQL Server.
 * @param {string} queryText - The SQL query to execute.
 * @returns {Promise<Object>} - The query result in universal format.
 */
async function querySqlServer(systemConfig, queryText) {
  const config = {
    user: systemConfig.Username,
    password: systemConfig.Password,
    server: systemConfig.Host,
    database: systemConfig.Database,
    port: systemConfig.Port || 1433,
    options: {
      encrypt: systemConfig.Encrypt || true,
      trustServerCertificate: systemConfig.TrustServerCertificate || true,
    },
  };
  
  try {
    let pool = await sql.connect(config);
    logger.info('Connected to SQL Server.');
    let result = await pool.request().query(queryText);
    logger.info('SQL Server query executed successfully.');

    if (result.recordset.length > 0) {
      const columns = Object.keys(result.recordset[0]);
      const types = columns.map((col) => typeof result.recordset[0][col] === 'number' ? 'FLOAT' : 'STRING');
      const processedRows = processSqlServerRows(result.recordset, columns);

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
    logger.error('SQL Server query error:', error);
    throw error;
  } finally {
    await sql.close();
    logger.info('SQL Server connection closed.');
  }
}

module.exports = { querySqlServer };


