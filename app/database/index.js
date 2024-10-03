// app/database/index.js

const bigquery = require('./bigquery');
const snowflake = require('./snowflake');
const postgres = require('./postgres');
const sqlserver = require('./sqlserver');
// Add other database modules as needed

/**
 * Executes a query based on the system configuration.
 *
 * @param {Object} systemConfig - Configuration object for the system.
 * @param {string} query - The SQL query to execute.
 * @returns {Promise<Object>} - The result of the query.
 */
async function executeQuery(systemConfig, query) {
  switch (systemConfig.SystemType.toLowerCase()) {
    case 'bigquery':
      return await bigquery.queryBigQuery(query);
    case 'snowflake':
      return await snowflake.querySnowflake(query);
    case 'postgres':
      return await postgres.queryPostgres(query);
    case 'sqlserver':
      return await sqlserver.querySqlServer(query);
    default:
      throw new Error(`Unsupported system type: ${systemConfig.SystemType}`);
  }
}

module.exports = { executeQuery };

