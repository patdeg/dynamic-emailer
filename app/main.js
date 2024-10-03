// app/main.js

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const ejs = require('ejs');
const { readConfig } = require('./config');
const { executeQuery } = require('./database'); // Import executeQuery from database/index.js
const { sendEmail } = require('./email');
const { generateChartVegaLite } = require('./chart');
const logger = require('./utils/logger');

/**
 * Helper function to resolve file paths.
 *
 * @param  {...string} segments - Path segments to join.
 * @returns {string} - The resolved absolute path.
 */
function resolvePath(...segments) {
  return path.join(...segments);
}

/**
 * Retrieves the system configuration based on the system name.
 *
 * @param {string} systemName - The name of the system (e.g., 'BigQuerySystem').
 * @returns {Object} - The system configuration object.
 * @throws {Error} - If the system configuration is not found.
 */
function getSystemConfig(systemName) {
  const config = readConfig();
  const systemConfig = config.find(c => c.System.toLowerCase() === systemName.toLowerCase());
  if (!systemConfig) {
    throw new Error(`System configuration not found for: ${systemName}`);
  }
  return systemConfig;
}

/**
 * Processes a single email based on the provided email folder path.
 *
 * @param {string} emailFolderPath - The absolute path to the email folder.
 */
async function processEmail(emailFolderPath) {
  try {
    logger.info(`\n=== Processing email at: ${emailFolderPath} ===`);

    // Verify that the email folder exists
    if (!fs.existsSync(emailFolderPath)) {
      throw new Error(`Email folder does not exist: ${emailFolderPath}`);
    }

    // Define paths to essential files within the email folder
    const paramXmlPath = resolvePath(emailFolderPath, 'param.xml');
    const templatePath = resolvePath(emailFolderPath, 'template.html');
    const headerPath = resolvePath(emailFolderPath, 'header.html');
    const bodyPath = resolvePath(emailFolderPath, 'body.html');
    const footerPath = resolvePath(emailFolderPath, 'footer.html');

    // Ensure all essential files are present
    const essentialFiles = [paramXmlPath, templatePath, headerPath, bodyPath, footerPath];
    essentialFiles.forEach(filePath => {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file not found: ${filePath}`);
      }
    });

    logger.info('All essential files are present.');

    // Read and parse param.xml
    const paramXml = fs.readFileSync(paramXmlPath, 'utf8');
    const parser = new xml2js.Parser();
    const param = await parser.parseStringPromise(paramXml);
    const parameter = param.parameter;

    // Extract parameters from param.xml
    const name = parameter.name[0];
    const toEmails = parameter.to.map(emailObj => emailObj.email[0]);
    const system = parameter.system[0];
    const preview = parameter.preview[0];
    const format = parameter.format ? parameter.format[0] : 'html';
    const importance = parameter.importance ? parameter.importance[0] : 'Normal';

    logger.info(`Email Subject: ${name}`);
    logger.info(`Recipients: ${toEmails.join(', ')}`);
    logger.info(`System: ${system}`);
    logger.info(`Preview Text: ${preview}`);
    logger.info(`Format: ${format}`);
    logger.info(`Importance: ${importance}`);

    // Read email-specific templates
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const headerHtml = fs.readFileSync(headerPath, 'utf8');
    const bodyHtml = fs.readFileSync(bodyPath, 'utf8');
    const footerHtml = fs.readFileSync(footerPath, 'utf8');

    logger.info('Email templates loaded successfully.');

    // Retrieve system configuration
    const systemConfig = getSystemConfig(system);

    // Execute data queries defined in param.xml
    const dataResults = [];
    if (parameter.data) {
      for (const dataItem of parameter.data) {
        if (dataItem.queryfile) {
          const queryFilePath = resolvePath(emailFolderPath, dataItem.queryfile[0]);
          const query = fs.readFileSync(queryFilePath, 'utf8');
          logger.info(`Executing query from file: ${dataItem.queryfile[0]}`);
          const result = await executeQuery(systemConfig, query);
          dataResults.push(result);
          logger.info('Query executed successfully.');
        }
        // Handle inline queries if present
        if (dataItem.query) {
          const query = dataItem.query[0];
          logger.info('Executing inline query.');
          const result = await executeQuery(systemConfig, query);
          dataResults.push(result);
          logger.info('Inline query executed successfully.');
        }
      }
    }

    // Generate charts as defined in param.xml
    const charts = [];
    if (parameter.chart) {
      for (const chartItem of parameter.chart) {
        let query = '';
        if (chartItem.queryfile) {
          const queryFilePath = resolvePath(emailFolderPath, chartItem.queryfile[0]);
          query = fs.readFileSync(queryFilePath, 'utf8');
          logger.info(`Executing chart query from file: ${chartItem.queryfile[0]}`);
        }
        if (chartItem.query) {
          query = chartItem.query[0];
          logger.info('Executing inline chart query.');
        }

        // Load Vega-Lite configuration
        const vegafile = chartItem.vegafile ? resolvePath(emailFolderPath, chartItem.vegafile[0]) : null;
        let vegaSpec = {};

        if (vegafile && fs.existsSync(vegafile)) {
          const vegaConfigContent = fs.readFileSync(vegafile, 'utf8');
          vegaSpec = JSON.parse(vegaConfigContent);
          logger.info(`Loaded Vega-Lite config from: ${chartItem.vegafile[0]}`);
        } else if (chartItem.vega) {
          vegaSpec = JSON.parse(chartItem.vega[0]);
          logger.info('Loaded Vega-Lite config from inline definition.');
        } else {
          throw new Error(`Vega-Lite configuration missing for chart in ${emailFolderPath}`);
        }

        // Execute the chart query
        const result = await executeQuery(systemConfig, query);

        // Prepare data for Vega-Lite
        const data = result.rows.map(row => {
          const rowData = {};
          result.fields.forEach((field, index) => {
            rowData[field.name] = row[index];
          });
          return rowData;
        });

        // Generate chart image
        const chartFileName = `chart_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.png`;
        const chartFilePath = path.join('/tmp', chartFileName); // Ensure /tmp exists and is writable

        await generateChartVegaLite(vegaSpec, data, chartFilePath);
        logger.info(`Generated chart image at: ${chartFilePath}`);

        // Add chart details for email embedding
        charts.push({
          title: chartItem.title || 'Chart',
          cid: chartFileName, // Content-ID for embedding in the email
          path: chartFilePath
        });
      }
    }

    // Compile the email template with EJS
    const compiledTemplate = ejs.compile(templateHtml);
    const templateData = {
      subject: name,
      header: headerHtml,
      body: bodyHtml,
      footer: footerHtml,
      data: dataResults, // Pass as needed for the body template
      charts: charts.map(chart => ({
        title: chart.title,
        cid: chart.cid
      })),
      now: new Date().toLocaleString()
    };

    const htmlBody = compiledTemplate(templateData);
    logger.info('Email HTML body compiled successfully.');

    // Prepare email attachments (charts)
    const attachments = charts.map(chart => ({
      filename: chart.cid,
      path: chart.path,
      cid: chart.cid // Same as referenced in the HTML for embedding
    }));

    // Send the email
    await sendEmail(toEmails, name, htmlBody, attachments);
    logger.info(`Email "${name}" sent successfully to: ${toEmails.join(', ')}`);

    // Clean up temporary chart files
    charts.forEach(chart => {
      fs.unlink(chart.path, (err) => {
        if (err) {
          logger.warn(`Failed to delete temporary chart file: ${chart.path}`, err);
        } else {
          logger.info(`Deleted temporary chart file: ${chart.path}`);
        }
      });
    });

    logger.info(`=== Completed processing email at: ${emailFolderPath} ===\n`);

  } catch (err) {
    logger.error(`Error processing email at "${emailFolderPath}":`, err);
    // Depending on requirements, consider exiting or continuing
    process.exit(1);
  }
}

// Entry point of the script
(async () => {
  const args = process.argv.slice(2); // Retrieve command-line arguments

  if (args.length !== 1) {
    console.error('Usage: node app/main.js /path/to/email_folder');
    process.exit(1);
  }

  const emailFolderPath = path.resolve(args[0]); // Resolve to absolute path

  // Start processing the specified email
  await processEmail(emailFolderPath);
})();


