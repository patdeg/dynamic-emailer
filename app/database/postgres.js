/**
 * @file postgres.js
 * @description Module for executing queries against PostgreSQL.
 */

const { Client } = require('pg');
const logger = require('../utils/logger');

/**
 * Processes PostgreSQL rows, converting undefined values to empty strings and handling types.
 * @param {Array} rows - The rows returned from the PostgreSQL query.
 * @param {Array} columns - The column names.
 * @returns {Array} - Processed rows with undefined values handled.
 */
function processPostgresRows(rows, columns) {
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
 * Executes a PostgreSQL SQL query using the query() method and returns a standardized format.
 * @param {Object} systemConfig - The system configuration for PostgreSQL.
 * @param {string} queryText - The SQL query to execute.
 * @returns {Promise<Object>} - The query result in universal format.
 */
async function queryPostgres(systemConfig, queryText) {
  const client = new Client({
    host: systemConfig.Host,
    user: systemConfig.Username,
    password: systemConfig.Password,
    database: systemConfig.Database,
    port: systemConfig.Port || 5432,
    ssl: systemConfig.SSL || false,
  });
  
  try {
    await client.connect();
    logger.info('Connected to PostgreSQL.');
    const res = await client.query(queryText);
    logger.info('PostgreSQL query executed successfully.');

    if (res.rows.length > 0) {
      const columns = res.fields.map(field => field.name);
      const types = res.fields.map(field => field.dataTypeID === 1700 ? 'FLOAT' : 'STRING'); // Basic type inference
      const processedRows = processPostgresRows(res.rows, columns);

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
    logger.error('PostgreSQL query error:', error);
    throw error;
  } finally {
    await client.end();
    logger.info('PostgreSQL connection closed.');
  }
}

module.exports = { queryPostgres };


