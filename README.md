# Blockchain Transaction Monitoring System

**Note:** Updates done post submission of task: Added tests

A Node.js application that monitors Ethereum blockchain transactions in real-time and stores matching transactions based on configurable rules.

## Technologies Used

- Node.js (v16+)
- PostgreSQL (v13+)
- Sequelize ORM
- ethers.js (v6)
- Infura API

## Setup Instructions

### Prerequisites

- Node.js v16 or higher
- Docker and Docker Compose
- Infura API key

### Environment Setup

1. Clone the repository
2. Rename `.env.example` file in the project root to `.env` with the following values:

```
PORT=3000
DB_URI=postgresql://postgres:postgres@localhost:5432/blockchain_db
NETWORK=mainnet // could also use sepolia 
INFURA_API=your_infura_api_key_here
```

### Database Setup

Start PostgreSQL using Docker Compose:

```bash
docker-compose up -d
```

This will start a PostgreSQL instance on port 5432 with the following credentials:
- Username: postgres
- Password: postgres
- Database: blockchain_db

### Installation

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

## API Endpoints

### Configuration Management

#### Create a Configuration

```
POST /api/configurations
```

Example body:
```json
{
  "name": "To Address Monitor",
  "description": "Track transactions TO specific address",
  "active": true,
  "rules": {
    "toAddress": "0xa74563eC55836d385424B746834e834fF9081e2b"
  }
}
```

#### Get All Configurations

```
GET /api/configurations
```

Response: Array of configuration objects.

#### Get Configuration by ID

```
GET /api/configurations/:id
```

Response: Configuration object with the specified ID.

#### Update Configuration

```
PATCH /api/configurations/:id
```

Example body:
```json
{
  "active": false,
  "rules": {
    "minValue": "1000000000000000000"
  }
}
```

This will update the specified fields while preserving the rest of the configuration.

#### Delete Configuration

```
DELETE /api/configurations/:id
```

Response: Success message or 404 if not found.

## Configuration Rules

The system supports the following rules for transaction matching:

| Rule | Type | Description | Example |
|------|------|-------------|---------|
| `toAddress` | String | Target address for transactions | `"0xa74563eC55836d385424B746834e834fF9081e2b"` |
| `fromAddress` | String | Source address for transactions | `"0x1234567890123456789012345678901234567890"` |
| `minValue` | String | Minimum transaction value in wei | `"1000000000000000000"` (1 ETH) |
| `maxValue` | String | Maximum transaction value in wei | `"5000000000000000000"` (5 ETH) |

Special cases:
- To track contract creation transactions, set `toAddress` to `"0x"`
- Multiple rules are combined with AND logic (all rules must match)

## Examples

### Track High-Value Transactions

```json
{
  "name": "High Value Transactions",
  "description": "Track transactions over 10 ETH",
  "active": true,
  "rules": {
    "minValue": "10000000000000000000"
  }
}
```

### Track Transactions Between Specific Addresses

```json
{
  "name": "Specific Transfer",
  "description": "Track transactions between two addresses",
  "active": true,
  "rules": {
    "fromAddress": "0x1234567890123456789012345678901234567890",
    "toAddress": "0xa74563eC55836d385424B746834e834fF9081e2b"
  }
}
```

### Track Contract Creations

```json
{
  "name": "Contract Deployments",
  "description": "Track new contract deployments",
  "active": true,
  "rules": {
    "toAddress": "0x"
  }
}
```

## Monitoring

The system processes each new Ethereum block as it's added to the blockchain. Transactions that match active configuration rules are stored in the database.

You can view stored transactions using PostgreSQL tools like pgAdmin or direct database queries.