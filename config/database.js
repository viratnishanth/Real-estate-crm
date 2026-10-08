require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Required for Neon cloud database
    }
  },
  logging: false, // Set to true if you want to see SQL queries in console
});

module.exports = sequelize;
