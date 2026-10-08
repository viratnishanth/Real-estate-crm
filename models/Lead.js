const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stage: {
    type: DataTypes.ENUM(
      'New', 
      'Contacted', 
      'Site Visit', 
      'Interested', 
      'Negotiation', 
      'Booked', 
      'Lost'
    ),
    defaultValue: 'New',
  },
  property_interested: {
    type: DataTypes.STRING, // Can just be text for now based on UI
    allowNull: true,
  },
  property_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  budget: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  follow_up_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  assigned_to: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  source: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Website',
  }
}, {
  timestamps: true,
  tableName: 'leads',
});

module.exports = Lead;
