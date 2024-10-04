/**
 * @file app.js
 * @description Main application file for Emailer.js. Processes email configurations, executes queries,
 * generates charts, compiles templates, and sends emails.
 */

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const ejs = require('ejs');
const { readConfig } = require('./config');
const { executeQuery } = require('./database');
const { sendEmail } = require('./email');
const { generateChart } = require('./chart');
const logger = require('./utils/logger');

/**
 * Resolves a sequence of path segments into an absolute path.
 * @param {...string} segments - Path segments to resolve.
 * @returns {string} - The resolved absolute path.
 */
function resolvePath(...segments) {
  return path.join(...segments);
}

/**
 * Processes an email configuration folder, executes queries, generates charts,
 * compiles templates, and sends the email.
 * @param {string} emailFolderPath - Path to the email configuration folder.
 */
async function processEmail(emailFolderPath) {
  try {
    logger.info(`\n=== Processing email at: ${emailFolderPath} ===`);

    // Define paths to essential files
    const paramXmlPath = resolvePath(emailFolderPath, 'param.xml');
    const templatePath = resolvePath(emailFolderPath, 'template.html');
    const headerPath = resolvePath(emailFolderPath, 'header.html');
    const bodyPath = resolvePath(emailFolderPath, 'body.html');
    const footerPath = resolvePath(emailFolderPath, 'footer.html');

    // Check if all essential files exist
    const essentialFiles = [paramXmlPath, templatePath, headerPath, bodyPath, footerPath];
    essentialFiles.forEach(filePath => {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file not found: ${filePath}`);
      }
    });

    // Read and parse param.xml
    const paramXml = fs.readFileSync(paramXmlPath, 'utf8');
    const parser = new xml2js.Parser();
    const param = await parser.parseStringPromise(paramXml);
    const parameter = param.parameter;

    // Extract email parameters
    const name = parameter.name[0];
    const defaultSystem = parameter.defaultsystem[0];
    const toEmails = parameter.to.map(emailObj => emailObj.email[0]);
    const preview = parameter.preview[0];
    const format = parameter.format ? parameter.format[0] : 'html';

    // Read template files
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const headerHtml = fs.readFileSync(headerPath, 'utf8');
    const bodyHtml = fs.readFileSync(bodyPath, 'utf8');
    const footerHtml = fs.readFileSync(footerPath, 'utf8');

    // Combine templates into one
    const augmentedTemplate = templateHtml
      .replace('<!-- Header Section -->', headerHtml)
      .replace('<!-- Body Section -->', bodyHtml)
      .replace('<!-- Footer Section -->', footerHtml);


    // Execute data queries
    const dataResults = [];
    if (parameter.data) {
      for (const dataItem of parameter.data) {
        system = defaultSystem;
	if (dataItem.system) {
		system = dataItem.system[0];
	}
        logger.debug("System:", system);
	const systemConfig = readConfig().find(conf => conf.System.toLowerCase() === system.toLowerCase());
        if (!systemConfig) {
          throw new Error(`System configuration not found for: ${system}`);
        }
        const query = dataItem.queryfile
          ? fs.readFileSync(resolvePath(emailFolderPath, dataItem.queryfile[0]), 'utf8')
          : dataItem.query[0];

        const result = await executeQuery(systemConfig, query);
        dataResults.push(result);
      }
    }

    // Generate charts
    const charts = [];
    if (parameter.chart) {
      for (const chartItem of parameter.chart) {
        system = defaultSystem;
	if (chartItem.system) {
		system = chartItem.system[0];
	}
        const systemConfig = readConfig().find(conf => conf.System.toLowerCase() === system.toLowerCase());
        if (!systemConfig) {
          throw new Error(`System configuration not found for: ${system}`);
        }
        const query = chartItem.queryfile
          ? fs.readFileSync(resolvePath(emailFolderPath, chartItem.queryfile[0]), 'utf8')
          : chartItem.query[0];

        const vegafile = chartItem.vegafile ? resolvePath(emailFolderPath, chartItem.vegafile[0]) : null;
        const vegaSpec = vegafile ? JSON.parse(fs.readFileSync(vegafile, 'utf8')) : JSON.parse(chartItem.vega[0]);

        const result = await executeQuery(systemConfig, query);
        const chartFileName = `chart_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.png`;
        const chartFilePath = path.join('/tmp', chartFileName);

        if (!result || !result.rows) {
          logger.error('Query result for chart is missing rows.');
          continue;
        }

        logger.info('Generating chart data...');
        await generateChart(vegaSpec, result, chartFilePath);

	charts.push({
          title: chartItem.title || 'Chart',     // Chart title from param.xml or default
          cid: chartItem.cid[0] || chartFileName, // cid from param.xml or fallback to chartFileName
          path: chartFilePath,                   // Path to the generated chart file
        });

      }
    }

    logger.debug("Data:",JSON.stringify(dataResults, null, 2));
    logger.debug("Charts:",JSON.stringify(charts, null, 2));
  
	  // Compile the email template with data and charts
    const compiledTemplate = ejs.render(augmentedTemplate, {
      subject: name,
      preview: preview,
      data: dataResults,  // Pass the processed data results here
      charts: charts,  // Pass the chart information here
      now: new Date().toLocaleString(),
    });

      //charts: charts.map(chart => ({ title: chart.title, cid: chart.cid })),

    // Prepare attachments for email
    const attachments = charts.map(chart => ({
      filename: chart.cid,
      path: chart.path,
      cid: chart.cid,
    }));

    // Send the email
    await sendEmail(toEmails, name, compiledTemplate, attachments);

    // Clean up chart images
    charts.forEach(chart => fs.unlink(chart.path, err => {
      if (err) logger.warn(`Failed to delete chart: ${chart.path}`);
    }));

    logger.info(`=== Completed processing email at: ${emailFolderPath} ===\n`);
  } catch (err) {
    logger.error(`Error processing email at "${emailFolderPath}": ${err.message}`);
    logger.error(`Stack trace: ${err.stack}`);
    process.exit(1);
  }
}

// Entry point
(async () => {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error('Usage: node app.js /path/to/email_folder');
    process.exit(1);
  }

  const emailFolderPath = path.resolve(args[0]);
  await processEmail(emailFolderPath);
})();


