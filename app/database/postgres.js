// app/database/postgres.js

const { Client } = require('pg');
const logger = require('../utils/logger');

/**
 * Executes a PostgreSQL SQL query.
 *
 * @param {string} host - The PostgreSQL host.
 * @param {string} user - The PostgreSQL user.
 * @param {string} password - The PostgreSQL password.
 * @param {string} database - The PostgreSQL database name.
 * @param {string} query - The SQL query to execute.
 * @returns {Promise<Object>} - The query result.
 */
async function query(host, user, password, database, query) {
  const client = new Client({
    host,
    user,
    password,
    database,
  });
  
  try {
    await client.connect();
    logger.info('Connected to PostgreSQL.');
    const res = await client.query(query);
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

module.exports = { query };


