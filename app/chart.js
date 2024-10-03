// app/chart.js

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
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
    // Add data to Vega-Lite spec
    vegaSpec.data = { values: data };
    
    // Write the Vega-Lite spec to a temporary JSON file
    const tempSpecPath = path.join(path.dirname(outputPath), `temp_spec_${Date.now()}.json`);
    fs.writeFileSync(tempSpecPath, JSON.stringify(vegaSpec, null, 2));
    
    // Use vega-cli to generate the PNG (ensure vega-cli is installed globally)
    const command = `vega -f png ${tempSpecPath} -o ${outputPath}`;
    
    exec(command, (error, stdout, stderr) => {
      // Delete the temporary spec file
      fs.unlinkSync(tempSpecPath);
      
      if (error) {
        logger.error('Error generating chart with Vega-Lite:', error);
        return reject(error);
      }
      logger.info('Chart generated successfully at %s', outputPath);
      resolve();
    });
  });
}

module.exports = { generateChartVegaLite };


