require('dotenv').config();
const { Sequelize } = require('sequelize');

// Si tienes la cadena completa de Neon (DATABASE_URL), úsala. Si no, usa las partes.
const sequelize = new Sequelize(
  process.env.DATABASE_URL || process.env.DB_NAME,
  process.env.DATABASE_URL ? undefined : process.env.DB_USER,
  process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
  {
    host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
    port: process.env.DATABASE_URL ? undefined : process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    // 🔥 IMPORTANTE PARA NEON
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

module.exports = sequelize;