# Nimu Academy Backend

Professional MERN Stack Backend for Nimu Cooking Academy.

## Folder Structure

```text
backend/
├── src/
│   ├── config/             # Configuration (DB, Swagger)
│   ├── database/           # Database layer
│   │   ├── tables/         # SQL table definitions
│   │   ├── seeds/          # Initial data seeds
│   │   ├── createTables.js # Orchestrator for tables
│   │   └── seedData.js     # Orchestrator for seeding
│   ├── controllers/        # Request handlers
│   ├── routes/             # API route definitions
│   ├── middleware/         # Custom middlewares (Auth, Upload)
│   ├── services/           # Business logic
│   ├── utils/              # Helper functions
│   └── server.js           # Entry point
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
└── README.md               # Documentation
```

## Setup

1. `cd server`
2. `npm install`
3. `npm run dev`

## API Documentation

Visit `http://localhost:8000/api-docs` for full API documentation and interactive testing.
