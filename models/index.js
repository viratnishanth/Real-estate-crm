const sequelize = require('../config/database');

// Import Models
const User = require('./User');
const Lead = require('./Lead');
const Property = require('./Property');
const Booking = require('./Booking');

// Setup Associations (Relationships)

// User -> Leads association removed temporarily since we are using assigned_to as a simple String column right now.
// Booking Associations
Lead.hasMany(Booking, { foreignKey: 'lead_id', as: 'bookings' });
Booking.belongsTo(Lead, { foreignKey: 'lead_id', as: 'lead' });

Property.hasMany(Booking, { foreignKey: 'property_id', as: 'bookings' });
Booking.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

// Export Models
const db = {
  sequelize,
  User,
  Lead,
  Property,
  Booking
};

module.exports = db;
