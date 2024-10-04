/**
 * @file chart.js
 * @description Module for generating charts using Vega-Lite specifications.
 */

const fs = require('fs');
const path = require('path');
const vega = require('vega');
const vegaLite = require('vega-lite');
const { createCanvas } = require('canvas');
const logger = require('./utils/logger');

/**
 * Prepares the Vega data by mapping result fields and rows.
 * Handles various data types such as dates and numbers dynamically.
 * @param {Object} result - The query result from the database containing fields and rows.
 * @returns {Array<Object>} - The data prepared for Vega-Lite specification.
 */
function prepareVegaData(result) {
  if (!result.rows || !result.fields) {
    logger.error('Result is missing rows or fields.');
    return [];
  }
  logger.info(`Preparing Vega data. Rows: ${result.rows.length}, Fields: ${result.fields.length}`);

  return result.rows.map(row => {
    const processedRow = {};

    result.fields.forEach(field => {
      let value = row[field.name];

      if (value instanceof Date) {
        value = value.toISOString().split('T')[0]; // Format dates as YYYY-MM-DD
      } else if (typeof value === 'object' && value !== null && value.value) {
        value = value.value; // Handle special types like BigQueryDate
      } else if (typeof value === 'number') {
        // Leave numbers as-is
      } else {
        value = String(value); // Convert to string by default
      }

      processedRow[field.name] = value;
    });

    return processedRow;
  });
}

/**
 * Generates a chart image from Vega-Lite specification and data.
 * @param {Object} vegaSpecTemplate - The Vega-Lite JSON specification.
 * @param {Object} result - The query result containing fields and rows.
 * @param {string} outputPath - The path where the generated chart image will be saved.
 * @returns {Promise<void>}
 */
async function generateChart(vegaSpecTemplate, result, outputPath) {
  const vegaData = prepareVegaData(result);

  const vegaSpec = {
    ...vegaSpecTemplate,
    data: { values: vegaData }
  };

  return new Promise((resolve, reject) => {
    try {
      const compiledSpec = vegaLite.compile(vegaSpec).spec;
      const runtime = vega.parse(compiledSpec);
      const view = new vega.View(runtime)
        .renderer('canvas')  // Use 'canvas' to generate PNG
        .initialize();

      view.toCanvas().then(canvas => {
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const out = fs.createWriteStream(outputPath);
        const stream = canvas.createPNGStream();  // Create PNG stream
        stream.pipe(out);
        out.on('finish', () => {
          logger.info(`Chart generated successfully as PNG at ${outputPath}`);
          resolve();
        });
      }).catch(error => {
        logger.error('Error generating PNG with Vega-Lite:', error);
        reject(error);
      });
    } catch (error) {
      logger.error('Error compiling Vega-Lite specification:', error);
      reject(error);
    }
  });
}

module.exports = { generateChart };


