const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Unit = sequelize.define('Unit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  unit_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING, // e.g., '2BHK', '3BHK', 'Villa'
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Available', 'Booked'),
    defaultValue: 'Available',
  },
  building_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: true,
  tableName: 'units',
});

module.exports = Unit;
