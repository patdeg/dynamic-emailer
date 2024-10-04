/**
 * @file sqlserver.js
 * @description Module for executing queries against SQL Server.
 */

const sql = require('mssql');
const logger = require('../utils/logger');

/**
 * Executes a SQL Server SQL query.
 * @param {Object} systemConfig - The system configuration for SQL Server.
 * @param {string} queryText - The SQL query to execute.
 * @returns {Promise<Object>} - The query result.
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
    return { rows: result.recordset, fields: result.columns };
  } catch (error) {
    logger.error('SQL Server query error:', error);
    throw error;
  } finally {
    await sql.close();
    logger.info('SQL Server connection closed.');
  }
}

module.exports = { querySqlServer };


