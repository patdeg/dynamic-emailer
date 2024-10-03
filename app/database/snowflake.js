// app/database/snowflake.js

const snowflake = require('snowflake-sdk');
const logger = require('../utils/logger'); // Ensure logger.js is properly implemented
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Establishes a connection to Snowflake.
 *
 * @returns {snowflake.Connection} - Snowflake connection object.
 */
function createConnection() {
  const connection = snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT, // e.g., 'xy12345.east-us-2.azure'
    username: process.env.SNOWFLAKE_USERNAME,
    password: process.env.SNOWFLAKE_PASSWORD,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE, // Optional
    database: process.env.SNOWFLAKE_DATABASE, // Optional
    schema: process.env.SNOWFLAKE_SCHEMA, // Optional
    role: process.env.SNOWFLAKE_ROLE, // Optional
  });

  return new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
      if (err) {
        logger.error('Unable to connect to Snowflake: ' + err.message);
        reject(err);
      } else {
        logger.info('Successfully connected to Snowflake.');
        resolve(conn);
      }
    });
  });
}

/**
 * Executes a query on Snowflake.
 *
 * @param {string} query - The SQL query to execute.
 * @returns {Promise<Object>} - Resolves with query results.
 */
async function executeQuery(query) {
  let connection;
  try {
    connection = await createConnection();
  } catch (err) {
    throw new Error('Snowflake connection failed: ' + err.message);
  }

  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText: query,
      complete: (err, stmt, rows) => {
        if (err) {
          logger.error('Failed to execute query: ' + err.message);
          reject(err);
        } else {
          logger.info('Query executed successfully.');
          resolve({ statement: stmt, rows: rows });
        }
      },
    });
  });
}

/**
 * Closes the Snowflake connection.
 *
 * @param {snowflake.Connection} connection - The Snowflake connection to close.
 * @returns {Promise<void>}
 */
function closeConnection(connection) {
  return new Promise((resolve, reject) => {
    connection.destroy((err, conn) => {
      if (err) {
        logger.error('Error closing Snowflake connection: ' + err.message);
        reject(err);
      } else {
        logger.info('Snowflake connection closed.');
        resolve();
      }
    });
  });
}

module.exports = { executeQuery, closeConnection };


