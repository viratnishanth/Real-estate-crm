const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Building = sequelize.define('Building', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: true,
  tableName: 'buildings',
});

module.exports = Building;
