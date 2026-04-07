import knex from 'knex';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse DATABASE_URL if provided (Railway format), otherwise use individual env vars
const getDatabaseConnection = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'muktamar_agm_dev',
  };
};

// SSL configuration for production (Railway requires SSL)
const getSslConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return { rejectUnauthorized: false };
  }
  return false;
};

// Build knex config
const buildKnexConfig = () => {
  const baseConfig = {
    client: 'pg',
    pool: {
      min: 2,
      max: 20, // Support 1,000 concurrent users
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
    },
    migrations: {
      directory: path.join(__dirname, '../../db/migrations'),
      extension: 'js',
    },
    seeds: {
      directory: path.join(__dirname, '../../db/seeds'),
      extension: 'js',
    },
    searchPath: 'public',
  };

  const connectionConfig = getDatabaseConnection();

  if (typeof connectionConfig === 'string') {
    // DATABASE_URL format
    baseConfig.connection = {
      connectionString: connectionConfig,
      ssl: getSslConfig(),
    };
  } else {
    // Individual env vars format
    baseConfig.connection = {
      ...connectionConfig,
      ssl: getSslConfig(),
    };
  }

  return baseConfig;
};

const knexConfig = buildKnexConfig();

export const db = knex(knexConfig);

// Export connection test utility
export const testConnection = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

export const closeConnection = async () => {
  await db.destroy();
};

export default db;
