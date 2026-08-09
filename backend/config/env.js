// config/env.js
//
// Loads variables from .env and makes them available as a single, typed object.
// Every other file in the backend should import config FROM HERE instead of
// reading process.env directly — this way, if a variable is missing, we find
// out immediately when the server starts, not later when a request fails.

require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Did you copy .env.example to .env?`);
  }
  return value;
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),

  db: {
    host: required('DB_HOST'),
    port: parseInt(required('DB_PORT'), 10),
    name: required('DB_NAME'),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
};

module.exports = config;
