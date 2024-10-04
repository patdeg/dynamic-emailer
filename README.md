
# Emailer.js

## Overview

**Emailer.js** is a Node.js application for creating and sending customized, data-driven emails. The emails are generated based on configuration files and allow integration with various databases and visual charts using Vega-Lite.

## Features

- **Dynamic Email Generation:** Generates customized emails with dynamic content, including data tables and embedded charts.
- **Database Integration:** Supports BigQuery, Snowflake, PostgreSQL, and SQL Server.
- **Security:** Handles encryption for sensitive credentials and environment variables.
- **Charting:** Uses Vega-Lite for creating charts embedded within emails.
- **Logging:** Implements comprehensive logging using Winston.

## Prerequisites

- **Node.js** (v14 or later)
- **npm** (v6 or later)
  
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

4. **Configure Emailer Credentials:**

   Create a `.emailer_credentials` file in the root directory with the necessary database and email configurations in JSON format.

   Example of `.emailer_credentials`:

   ```json
   [
     {
       "System": "BigQuery",
       "SystemType": "bigquery",
       "ProjectId": "your_project_id",
       "KeyFile": "path/to/keyfile.json"
     },
     {
       "System": "SMTP",
       "SystemType": "smtp",
       "Host": "smtp.your-email.com",
       "Port": 587,
       "Username": "your_username",
       "Password": "encrypted_password"
     }
   ]
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

## Project Structure

```
emailer.js/
├── .gitignore
├── Makefile
├── README.md
├── LICENSE
├── .env
├── .email_credentials
├── keys/
│   ├── demeter-harvest-key.json
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

## Contact

For any questions or feedback, please contact Patrick Deglon at [pdeglon@gmail.com](mailto:pdeglon@gmail.com).
