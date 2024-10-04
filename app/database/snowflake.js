/**
 * @file snowflake.js
 * @description Module for executing queries against Snowflake.
 */

const snowflake = require('snowflake-sdk');
const logger = require('../utils/logger');

/**
 * Establishes a connection to Snowflake.
 * @param {Object} systemConfig - The system configuration for Snowflake.
 * @returns {Promise<snowflake.Connection>} - Snowflake connection object.
 */
function createConnection(systemConfig) {
  const connection = snowflake.createConnection({
    account: systemConfig.Account,
    username: systemConfig.Username,
    password: systemConfig.Password,
    warehouse: systemConfig.Warehouse,
    database: systemConfig.Database,
    schema: systemConfig.Schema,
    role: systemConfig.Role,
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
 * @param {Object} systemConfig - The system configuration for Snowflake.
 * @param {string} query - The SQL query to execute.
 * @returns {Promise<Object>} - Resolves with query results.
 */
async function querySnowflake(systemConfig, query) {
  let connection;
  try {
    connection = await createConnection(systemConfig);
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

module.exports = { querySnowflake, closeConnection };


