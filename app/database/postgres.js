/**
 * @file postgres.js
 * @description Module for executing queries against PostgreSQL.
 */

const { Client } = require('pg');
const logger = require('../utils/logger');

/**
 * Executes a PostgreSQL SQL query.
 * @param {Object} systemConfig - The system configuration for PostgreSQL.
 * @param {string} queryText - The SQL query to execute.
 * @returns {Promise<Object>} - The query result.
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
    return { rows: res.rows, fields: res.fields };
  } catch (error) {
    logger.error('PostgreSQL query error:', error);
    throw error;
  } finally {
    await client.end();
    logger.info('PostgreSQL connection closed.');
  }
}

module.exports = { queryPostgres };


