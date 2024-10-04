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
 * @param {Object} data - The processed data from the query result.
 * @returns {Array<Object>} - The data prepared for Vega-Lite specification.
 */
function prepareVegaData(data) {
  const { rows, columns } = data;
  
  logger.info(`Preparing Vega data. Rows: ${rows.length}, Columns: ${columns.length}`);

  // Return rows directly, as they are already formatted as objects with field names
  return rows.map(row => {
    const processedRow = {};

    columns.forEach(col => {
      processedRow[col] = row[col];  // Map each column to its corresponding field in the row
    });

    return processedRow;
  });
}

/**
 * Generates a chart image from Vega-Lite specification and data.
 * @param {Object} vegaSpecTemplate - The Vega-Lite JSON specification.
 * @param {Object} data - The processed data containing columns and rows.
 * @param {string} outputPath - The path where the generated chart image will be saved.
 * @returns {Promise<void>}
 */
async function generateChart(vegaSpecTemplate, data, outputPath) {
  const vegaData = prepareVegaData(data);
  logger.debug("Vega Data:");
  console.table(vegaData);

  const vegaSpec = {
    ...vegaSpecTemplate,
    data: { values: vegaData }  // Directly inject the mapped data into the Vega-Lite spec
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


