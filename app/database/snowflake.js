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


/***

const snowflake = require('snowflake-sdk');
const fs = require('fs');
const path = require('path');

async function querySnowflake() {

    const privateKeyPath = path.resolve(__dirname, 'snowflake_account.p8');

    const connection = snowflake.createConnection({
        account: 'account_name',
        username: 'user_name',
        authenticator: "SNOWFLAKE_JWT",
        privateKeyPath: privateKeyPath,
        warehouse: 'WAREHOUSE_NAME',
        database: 'DATABASE_NAME',
        schema: 'REFINED',
        logLevel: 'trace' // Enable detailed logging
    });

  try {
    // Create a connection object with your Snowflake credentials
    console.log('Private key path: ', privateKeyPath);    
    // Connect to Snowflake
    await new Promise((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) {
          reject(err);
        } else {
          console.log('Successfully connected to Snowflake.');
          resolve(conn);
        }
      });
    });

    // Execute a simple query
    const result = await new Promise((resolve, reject) => {
      connection.execute({
        sqlText: 'SELECT CURRENT_TIMESTAMP',
        complete: (err, stmt, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      });
    });

    console.log('Query result:', result);

  } catch (error) {
    console.error('Snowflake query error:', error);
  } finally {
    // Close the connection
    await new Promise((resolve, reject) => {
      connection.destroy((err, conn) => {
        if (err) {
          reject(err);
        } else {
          console.log('Snowflake connection closed.');
          resolve(conn);
        }
      });
    });
  }
}

// Execute the query
querySnowflake();

***/
