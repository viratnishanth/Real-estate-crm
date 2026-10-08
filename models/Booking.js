const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  lead_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  property_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  booking_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Confirmed', 'Cancelled'),
    defaultValue: 'Confirmed',
  }
}, {
  timestamps: true,
  tableName: 'bookings',
});

module.exports = Booking;
