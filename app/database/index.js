/**
 * @file index.js
 * @description Main database module that routes queries to the appropriate database handler based on system configuration.
 */

const bigquery = require('./bigquery');
const snowflake = require('./snowflake');
const postgres = require('./postgres');
const sqlserver = require('./sqlserver');
const logger = require('../utils/logger');

/**
 * Logs rows in a table format to the console.
 * @param {Array} rows - The rows of the query result.
 * @param {Array} fields - The fields (column names) of the query result.
 */
function logQueryResultToConsole(rows, fields) {
  if (rows.length > 0) {
    console.log('\nQuery Result:');
    console.table(rows);
  } else {
    console.log('\nNo rows returned from query.');
  }
}

/**
 * Executes a query based on the system configuration.
 * @param {Object} systemConfig - Configuration object for the system.
 * @param {string} query - The SQL query to execute.
 * @returns {Promise<Object>} - The result of the query.
 */
async function executeQuery(systemConfig, query) {
  let result;
  
  try {
    switch (systemConfig.SystemType.toLowerCase()) {
      case 'bigquery':
        result = await bigquery.queryBigQuery(systemConfig, query);
        break;
      case 'snowflake':
        result = await snowflake.querySnowflake(systemConfig, query);
        break;
      case 'postgres':
        result = await postgres.queryPostgres(systemConfig, query);
        break;
      case 'sqlserver':
        result = await sqlserver.querySqlServer(systemConfig, query);
        break;
      default:
        throw new Error(`Unsupported system type: ${systemConfig.SystemType}`);
    }

    // Extract rows and fields for logging
    const { rows, fields } = result;

    // Log the query results to the console in a table format
    logQueryResultToConsole(rows, fields);

    return result;

  } catch (error) {
    logger.error(`Query Execution Error: ${error.message}`);
    throw error;
  }
}

module.exports = { executeQuery };


