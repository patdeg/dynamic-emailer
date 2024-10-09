
# Dynamic-Emailer

## Overview

**Dynamic-Emailer** is a Node.js application for creating and sending customized, data-driven emails. The emails are generated based on configuration files and allow integration with various databases and visual charts using Vega-Lite.

## Features

- **Dynamic Email Generation:** Generates customized emails with dynamic content, including data tables and embedded charts.
- **Database Integration:** Supports BigQuery, Snowflake, PostgreSQL, SQL Server, MySQL, and SQLite.
- **Security:** Handles encryption for sensitive credentials and environment variables.
- **Charting:** Uses Vega-Lite for creating charts embedded within emails.
- **Logging:** Implements comprehensive logging using Winston.

## Prerequisites

- **Node.js** (v16 or later)
- **npm** (v7 or later)

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/patdeg/dynamic-emailer.git
   cd dynamic-emailers
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the root directory with the following variables:

   ```bash
   EMAILER_CONFIG=./.emailer_credentials
   ENCRYPTION_KEY=your_encryption_key

   # SMTP configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password_from_gmail
   SMTP_FROM='"Your Name" <your_email@gmail.com>'
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
       "KeyFile": "path/to/keyfile.json",
       "Email": "emailer@your_project_id.iam.gserviceaccount.com"
     },
     {
       "System": "MySQL",
       "SystemType": "mysql",
       "Host": "localhost",
       "Port": 3306,
       "Username": "your_username",
       "Password": "encrypted_password"
     },
     {
       "System": "SQLite",
       "SystemType": "sqlite",
       "Path": "emails/sqlite/mydb.sqlite"
     }
   ]
   ```

   **Note:** Use the `encrypt_password.js` utility to encrypt database passwords.

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
dynamic-emailer/
├── .gitignore
├── Makefile
├── README.md
├── LICENSE
├── .env
├── .emailer_credentials
├── keys/
│   └── your-key.json
├── app/
│   ├── chart.js
│   ├── config.js
│   ├── database/
│   │   ├── bigquery.js
│   │   ├── index.js
│   │   ├── mysql.js
│   │   ├── postgres.js
│   │   ├── snowflake.js
│   │   ├── sqlite.js
│   │   └── sqlserver.js
│   ├── email.js
│   ├── encrypt.js
│   ├── main.js
│   └── utils/
│       └── logger.js
├── emails/
│   ├── email1/
│   │   ├── body.html
│   │   ├── header.html
│   │   ├── footer.html
│   │   ├── param.xml
│   │   ├── template.html
│   │   ├── queries/
│   │   │   └── sample_query.sql
│   │   └── vega_config.json
│   └── create_sqlite.sh
├── package.json
└── package-lock.json
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please contact Patrick Deglon at [pdeglon@gmail.com](mailto:pdeglon@gmail.com).
