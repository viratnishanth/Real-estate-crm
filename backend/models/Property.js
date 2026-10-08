const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  project_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  unit_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  property_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  building_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  availability: {
    type: DataTypes.ENUM('Available', 'Booked', 'Sold'),
    defaultValue: 'Available',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true,
  tableName: 'properties',
});

module.exports = Property;
