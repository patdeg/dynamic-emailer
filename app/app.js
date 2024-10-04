const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const ejs = require('ejs');
const { readConfig } = require('./config');
const { executeQuery } = require('./database');
const { sendEmail } = require('./email');
const { generateChart } = require('./chart');
const logger = require('./utils/logger');

function resolvePath(...segments) {
  return path.join(...segments);
}

async function processEmail(emailFolderPath) {
  try {
    logger.info(`\n=== Processing email at: ${emailFolderPath} ===`);

    const paramXmlPath = resolvePath(emailFolderPath, 'param.xml');
    const templatePath = resolvePath(emailFolderPath, 'template.html');
    const headerPath = resolvePath(emailFolderPath, 'header.html');
    const bodyPath = resolvePath(emailFolderPath, 'body.html');
    const footerPath = resolvePath(emailFolderPath, 'footer.html');

    const essentialFiles = [paramXmlPath, templatePath, headerPath, bodyPath, footerPath];
    essentialFiles.forEach(filePath => {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file not found: ${filePath}`);
      }
    });

    const paramXml = fs.readFileSync(paramXmlPath, 'utf8');
    const parser = new xml2js.Parser();
    const param = await parser.parseStringPromise(paramXml);
    const parameter = param.parameter;

    const name = parameter.name[0];
    const toEmails = parameter.to.map(emailObj => emailObj.email[0]);
    const system = parameter.system[0];
    const preview = parameter.preview[0];
    const format = parameter.format ? parameter.format[0] : 'html';

    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const headerHtml = fs.readFileSync(headerPath, 'utf8');
    const bodyHtml = fs.readFileSync(bodyPath, 'utf8');
    const footerHtml = fs.readFileSync(footerPath, 'utf8');

    const augmentedTemplate = templateHtml
      .replace('<!-- Header Section -->', headerHtml)
      .replace('<!-- Body Section -->', bodyHtml)
      .replace('<!-- Footer Section -->', footerHtml);

    const systemConfig = readConfig().find(conf => conf.System.toLowerCase() === system.toLowerCase());
    if (!systemConfig) {
      throw new Error(`System configuration not found for: ${system}`);
    }

    const dataResults = [];
    if (parameter.data) {
      for (const dataItem of parameter.data) {
        const query = dataItem.queryfile
          ? fs.readFileSync(resolvePath(emailFolderPath, dataItem.queryfile[0]), 'utf8')
          : dataItem.query[0];

        const result = await executeQuery(systemConfig, query);
        dataResults.push(result);
      }
    }

    const charts = [];
    if (parameter.chart) {
      for (const chartItem of parameter.chart) {
        const query = chartItem.queryfile
          ? fs.readFileSync(resolvePath(emailFolderPath, chartItem.queryfile[0]), 'utf8')
          : chartItem.query[0];

        const vegafile = chartItem.vegafile ? resolvePath(emailFolderPath, chartItem.vegafile[0]) : null;
        const vegaSpec = vegafile ? JSON.parse(fs.readFileSync(vegafile, 'utf8')) : JSON.parse(chartItem.vega[0]);

        const result = await executeQuery(systemConfig, query);
        const chartFileName = `chart_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.png`;
        const chartFilePath = path.join('/tmp', chartFileName);

	console.log("Vega data:");
	console.table(result);

        await generateChart(vegaSpec, result, chartFilePath);

        charts.push({
          title: chartItem.title || 'Chart',
          cid: chartFileName,
          path: chartFilePath,
        });
      }
    }

    const compiledTemplate = ejs.render(augmentedTemplate, {
      subject: name,
      data: dataResults,
      charts: charts.map(chart => ({ title: chart.title, cid: chart.cid })),
      now: new Date().toLocaleString(),
    });

    const attachments = charts.map(chart => ({
      filename: chart.cid,
      path: chart.path,
      cid: chart.cid,
    }));

    await sendEmail(toEmails, name, compiledTemplate, attachments);
    charts.forEach(chart => fs.unlink(chart.path, err => { if (err) logger.warn(`Failed to delete chart: ${chart.path}`); }));

    logger.info(`=== Completed processing email at: ${emailFolderPath} ===\n`);
  } catch (err) {
    logger.error(`Error processing email at "${emailFolderPath}":`, err);
    process.exit(1);
  }
}

(async () => {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error('Usage: node app.js /path/to/email_folder');
    process.exit(1);
  }

  const emailFolderPath = path.resolve(args[0]);
  await processEmail(emailFolderPath);
})();


