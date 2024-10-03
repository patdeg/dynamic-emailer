// app/database/sqlserver.js

const sql = require('mssql');
const logger = require('../utils/logger');

/**
 * Executes a SQL Server SQL query.
 *
 * @param {string} host - The SQL Server host.
 * @param {string} user - The SQL Server user.
 * @param {string} password - The SQL Server password.
 * @param {string} database - The SQL Server database name.
 * @param {string} query - The SQL query to execute.
 * @returns {Promise<Object>} - The query result.
 */
async function query(host, user, password, database, query) {
  const config = {
    user: user,
    password: password,
    server: host,
    database: database,
    options: {
      encrypt: true, // Use this if you're on Windows Azure
      trustServerCertificate: true, // Change to true for local dev / self-signed certs
    },
  };
  
  try {
    let pool = await sql.connect(config);
    logger.info('Connected to SQL Server.');
    let result = await pool.request().query(query);
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

module.exports = { query };


