// app/chart.js
const fs = require('fs');
const path = require('path');
const vega = require('vega');
const vegaLite = require('vega-lite');
const { createCanvas, loadImage } = require('canvas'); // Required for rendering charts
const logger = require('./utils/logger');

/**
 * Generates a chart image from Vega-Lite specification and data.
 *
 * @param {Object} vegaSpec - The Vega-Lite JSON specification.
 * @param {Array} data - The data to be used in the chart.
 * @param {string} outputPath - The path where the generated chart image will be saved.
 * @returns {Promise<void>}
 */
function generateChartVegaLite(vegaSpec, data, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      // Add data to Vega-Lite spec
      vegaSpec.data = { values: data };
      
      // Compile the Vega-Lite specification into a Vega spec
      const vegaCompiledSpec = vegaLite.compile(vegaSpec).spec;

      // Create a new Vega View instance for rendering
      const runtime = vega.parse(vegaCompiledSpec);
      const view = new vega.View(runtime)
        .renderer('none') // We use the 'none' renderer since we'll output to canvas
        .initialize();

      // Render the chart to a canvas and save as PNG
      view.toCanvas()
        .then((canvas) => {
          // Ensure the output directory exists
          const outputDir = path.dirname(outputPath);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          // Save the PNG to the specified output path
          const out = fs.createWriteStream(outputPath);
          const stream = canvas.createPNGStream();
          stream.pipe(out);
          out.on('finish', () => {
            logger.info(`Chart generated successfully at ${outputPath}`);
            resolve();
          });
        })
        .catch((error) => {
          logger.error('Error generating chart with Vega-Lite:', error);
          reject(error);
        });
    } catch (error) {
      logger.error('Error compiling Vega-Lite specification:', error);
      reject(error);
    }
  });
}

module.exports = { generateChartVegaLite };



