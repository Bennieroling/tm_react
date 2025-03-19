# Telephony Monitoring System

A web-based application for monitoring telephony services across different countries. This system displays real-time status, success rates, and test results from telephony services.

## Project Structure

The project follows a client-server architecture:

- **Client**: React-based frontend for visualization
- **Server**: Node.js backend with Express, connecting to Azure SQL

## Features

- Global view showing telephony status by country
- Detailed view for each country showing specific test results
- Real-time updates with automatic polling
- Responsive design for desktop and mobile devices
- Docker support for easy deployment

## Prerequisites

- Node.js 14+ and npm
- Docker and Docker Compose (for containerized setup)
- Azure SQL Database

## Environment Variables

### Backend (.env file in server directory)

```
PORT=3001
NODE_ENV=development
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SERVER=your_azure_sql_server.database.windows.net
DB_NAME=your_database_name
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env file in client directory)

```
REACT_APP_API_URL=http://localhost:3001/api
```

## Running Locally (Without Docker)

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm start
```

## Running with Docker Compose

```bash
docker-compose up
```

## Database Schema

The application expects the following tables in your Azure SQL database:

### telemetry_status

This table contains the overall status per country:

```sql
CREATE TABLE dbo.telemetry_status (
    country_id VARCHAR(3) PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    last_updated DATETIME NOT NULL,
    success_rate DECIMAL(5,2) NOT NULL,
    total_tests INT NOT NULL
);
```

### telemetry_details

This table contains the detailed test results per country:

```sql
CREATE TABLE dbo.telemetry_details (
    test_id INT PRIMARY KEY,
    country_id VARCHAR(3) NOT NULL,
    test_time DATETIME NOT NULL,
    test_status VARCHAR(20) NOT NULL,
    response_time INT NULL,
    error_code VARCHAR(50) NULL,
    FOREIGN KEY (country_id) REFERENCES dbo.telemetry_status(country_id)
);
```

## Deployment to Azure

1. Push your Docker image to Azure Container Registry
2. Deploy to Azure App Service
3. Configure environment variables in Azure App Service Configuration

## Adding New Views

To add new views to the application:

1. Create a new view component in `client/src/views`
2. Add corresponding CSS in the same directory
3. Create any necessary API endpoints in the backend
4. Update the Navbar component to include the new view

## License

[MIT](LICENSE)