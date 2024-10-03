
# Emailer.js

## Overview

**Emailer.js** is a robust Node.js application designed to generate and send customized emails based on configurations defined in XML files. Leveraging data from various databases and dynamic visualizations, Emailer.js automates the creation of data-driven emails tailored to specific needs.

## Features

- **Dynamic Email Generation:** Create emails with customizable content, data tables, and embedded charts based on XML configurations.
- **Multi-Database Support:** Connect and query data from multiple databases including BigQuery, Snowflake, PostgreSQL, and SQL Server.
- **Secure Configuration Management:** Encrypts sensitive credentials and manages configurations through environment variables.
- **Flexible Charting:** Generate charts using Vega-Lite specifications, allowing for a wide range of visualizations.
- **Comprehensive Logging:** Utilizes Winston for detailed logging, aiding in monitoring and troubleshooting.
- **Modular Architecture:** Easily extendable to support additional databases or features as needed.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [Email Configuration](#email-configuration)
- [Usage](#usage)
- [Directory Structure](#directory-structure)
- [Creating a New Email Configuration](#creating-a-new-email-configuration)
- [Logging](#logging)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- **Node.js** (v14 or later)
- **npm** (v6 or later)
- **Global Dependencies:**
  - `vega-cli` (for chart generation)

  ```bash
  npm install -g vega-cli
  ```

- **Database Access:** Ensure you have the necessary credentials and permissions to access the databases you intend to query.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/emailer.js.git
   cd emailer.js
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**

   Create a `.env` file in the root directory and populate it with the necessary variables as detailed in the [Configuration](#configuration) section.

## Configuration

### Environment Variables

The application relies on several environment variables to manage configurations securely. Create a `.env` file in the root directory with the following variables:

```dotenv
# Encryption Key
ENCRYPTION_KEY=your_encryption_key

# SMTP Configuration
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_PASS=your_gmail_app_password

# BigQuery Configuration
BIGQUERY_PROJECT_ID=your_project_id
BIGQUERY_KEYFILE=path/to/your/bigquery/keyfile.json

# Snowflake Configuration
SNOWFLAKE_ACCOUNT=your_snowflake_account
SNOWFLAKE_USERNAME=your_snowflake_username
SNOWFLAKE_PASSWORD=your_snowflake_password
SNOWFLAKE_WAREHOUSE=your_warehouse
SNOWFLAKE_DATABASE=your_database
SNOWFLAKE_SCHEMA=your_schema
SNOWFLAKE_ROLE=your_role

# Other Configurations
EMAILER_CONFIG=path/to/.emailer_credentials
```

**Note:** Ensure that the `.env` file is listed in `.gitignore` to prevent sensitive information from being committed to version control.

### Email Configuration

Email configurations are defined within the `emails/` directory, each having its own subdirectory (e.g., `emails/email1`). Each email configuration includes:

- `param.xml`: Defines email parameters, data queries, and chart configurations.
- `header.html`, `body.html`, `footer.html`: HTML templates for different sections of the email.
- `template.html`: The main EJS template that stitches together the header, body, and footer.
- `queries/`: Directory containing SQL query files.
- `vega_config.json`: Vega-Lite configuration files for chart generation.

## Usage

To generate and send an email based on a specific configuration:

```bash
node app/main.js /path/to/email_folder
```

**Example:**

```bash
node app/main.js emails/email1
```

This command processes the `email1` configuration, executes the defined data queries, generates charts, compiles the email template, and sends the email to the specified recipients.

## Directory Structure

```
emailer.js/
├── .gitignore
├── Makefile
├── README.md
├── app/
│   ├── chart.js
│   ├── config.js
│   ├── database/
│   │   ├── bigquery.js
│   │   ├── index.js
│   │   ├── postgres.js
│   │   ├── snowflake.js
│   │   └── sqlserver.js
│   ├── email.js
│   ├── encrypt.js
│   ├── encrypt_password.js
│   ├── main.js
│   └── utils/
│       └── logger.js
├── emails/
│   └── email1/
│       ├── body.html
│       ├── category_vega_config.json
│       ├── footer.html
│       ├── header.html
│       ├── param.xml
│       ├── queries/
│       │   ├── additional_data.sql
│       │   ├── chart_data.sql
│       │   ├── category_chart_data.sql
│       │   └── template.sql
│       ├── template.html
│       └── vega_config.json
├── package.json
└── package-lock.json
```

## Creating a New Email Configuration

To set up a new email:

1. **Create a New Folder:**

   Inside the `emails/` directory, create a new subdirectory (e.g., `emails/email2`).

2. **Define `param.xml`:**

   Create a `param.xml` file defining the email's parameters, data sources, and charts.

3. **Add Templates:**

   Include `header.html`, `body.html`, `footer.html`, and `template.html` within the email folder. Customize these templates as needed.

4. **Add Queries and Vega Configurations:**

   Populate the `queries/` directory with necessary SQL files and add corresponding Vega-Lite configuration files for any charts.

5. **Execute the Emailer:**

   Run the application pointing to the new email configuration folder.

## Logging

The application uses Winston for logging. Logs are output to the console by default. To enable file logging:

1. **Uncomment File Transport:**

   In `app/utils/logger.js`, uncomment the file transport line and specify the desired log file path.

   ```javascript
   new transports.File({ filename: path.resolve(__dirname, '../../logs/app.log') })
   ```

2. **Log Rotation:**

   Implement log rotation to manage log file sizes and prevent excessive disk usage.

## Troubleshooting

- **Environment Variables Not Loading:**
  - Ensure the `.env` file is present in the root directory and properly formatted.
  - Verify that all required environment variables are defined.

- **Database Connection Issues:**
  - Check the credentials and access permissions for the respective databases.
  - Ensure that network configurations (e.g., firewall settings) allow connections to the databases.

- **Chart Generation Failures:**
  - Confirm that `vega-cli` is installed globally or adjust the `chart.js` to use a locally installed version.
  - Validate Vega-Lite configuration files for correctness.

- **Email Sending Errors:**
  - Verify SMTP credentials and ensure that less secure app access is enabled if using Gmail.
  - Check for any network issues that might prevent SMTP connections.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**

2. **Create a New Branch:**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

3. **Commit Your Changes:**

   ```bash
   git commit -m "Add your message here"
   ```

4. **Push to the Branch:**

   ```bash
   git push origin feature/YourFeatureName
   ```

5. **Open a Pull Request**

Please ensure your code adheres to the project's coding standards and include relevant tests and documentation.

## License

This project is licensed under the [MIT License](LICENSE).
