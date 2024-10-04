
# Emailer.js

## Overview

**Emailer.js** is a powerful Node.js application that automates the creation and sending of customized, data-driven emails. The emails are dynamically generated based on configuration files (such as XML) that allow the user to connect to multiple databases, retrieve data, and visualize it in embedded charts. The application can be tailored to meet the needs of a variety of email formats, ensuring that data delivery is both informative and visually appealing.

## Features

- **Dynamic Email Generation:** Generates emails with dynamic content, embedded data tables, and visual charts based on customizable templates.
- **Multi-Database Support:** Connects to and queries various databases such as BigQuery, Snowflake, PostgreSQL, and SQL Server.
- **Encryption & Security:** Encrypts sensitive credentials and environment variables to ensure secure configuration management.
- **Charting Support:** Creates dynamic charts using Vega-Lite specifications, enabling rich visual representations of data.
- **Logging:** Implements comprehensive logging with Winston to monitor processes and debug issues effectively.
- **Modular Architecture:** Modular and easily extensible to support additional email types, databases, or charting methods.

## Prerequisites

- **Node.js** (v14 or later)
- **npm** (v6 or later)
- **Global Dependencies:**
  - `vega-cli` (for chart generation)
  
  Install using:

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

3. **Configure Environment Variables:**

   Create a `.env` file in the root directory with the following variables:

   ```bash
   ENCRYPTION_KEY=your_encryption_key
   GMAIL_USER=your_gmail_user
   GMAIL_PASS=your_gmail_password
   BIGQUERY_PROJECT_ID=your_bigquery_project_id
   BIGQUERY_KEYFILE=path/to/your_bigquery_keyfile.json
   ```

## Usage

To run the application and send an email:

```bash
node app/app.js /path/to/email_folder
```

Example:

```bash
node app/app.js emails/email1
```

This command will process the email configuration from the `emails/email1` folder, execute the necessary queries, generate charts, and send the email.

## Project Structure

```
emailer.js/
├── .gitignore
├── Makefile
├── README.md
├── LICENSE
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
│   ├── main.js
│   └── utils/
│       └── logger.js
├── emails/
│   └── email1/
│       ├── body.html
│       ├── header.html
│       ├── footer.html
│       ├── param.xml
│       ├── template.html
│       ├── queries/
│       │   └── sample_query.sql
│       └── vega_config.json
├── package.json
└── package-lock.json
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request with your changes.

## Contact

For any questions or feedback, please contact [your-email@example.com].
