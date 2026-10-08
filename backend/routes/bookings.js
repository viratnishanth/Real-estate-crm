const express = require('express');
const router = express.Router();
const { Booking, Lead, Property } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

// GET all bookings
router.get('/', authMiddleware, async (req, res) => {
  try {
    let leadWhereClause = {};
    if (req.user.role === 'SALES' || req.user.role === 'SALES_EMPLOYEE') {
      leadWhereClause.assigned_to = req.user.name;
    }

    const bookings = await Booking.findAll({
      include: [
        { model: Lead, as: 'lead', where: leadWhereClause },
        { model: Property, as: 'property' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST create new booking
router.post('/', authMiddleware, async (req, res) => {
  const { lead_id, property_id } = req.body;
  try {
    // Prevent two users from booking the same unit
    const property = await Property.findByPk(property_id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    if (property.availability !== 'Available') {
      return res.status(400).json({ error: 'This property unit is already booked or sold.' });
    }

    // Create the booking
    const newBooking = await Booking.create({ lead_id, property_id, status: 'Confirmed' });
    
    // Update the property status
    property.availability = 'Booked';
    await property.save();

    // Optionally update lead stage to 'Booked'
    const lead = await Lead.findByPk(lead_id);
    if (lead) {
      lead.stage = 'Booked';
      await lead.save();
    }

    const createdBooking = await Booking.findByPk(newBooking.id, {
      include: [
        { model: Lead, as: 'lead' },
        { model: Property, as: 'property' }
      ]
    });

    res.status(201).json(createdBooking);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create booking' });
  }
});

// PUT update booking completely
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { lead_id, property_id, status } = req.body;
    
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // If property is being changed, free up the old property
    if (property_id && property_id !== booking.property_id) {
      const oldProperty = await Property.findByPk(booking.property_id);
      if (oldProperty) {
        oldProperty.availability = 'Available';
        await oldProperty.save();
      }

      // Check new property availability
      const newProperty = await Property.findByPk(property_id);
      if (!newProperty) return res.status(404).json({ error: 'New property not found' });
      if (newProperty.availability !== 'Available') {
        return res.status(400).json({ error: 'New property is already booked/sold.' });
      }
      
      if (status !== 'Cancelled') {
        newProperty.availability = 'Booked';
        await newProperty.save();
      }
    } else {
      // Property not changed, but status might be changed
      if (status === 'Cancelled' && booking.status !== 'Cancelled') {
        const property = await Property.findByPk(booking.property_id);
        if (property) {
          property.availability = 'Available';
          await property.save();
        }
      } else if (status === 'Confirmed' && booking.status === 'Cancelled') {
        const property = await Property.findByPk(booking.property_id);
        if (property) {
          if(property.availability !== 'Available') {
              return res.status(400).json({ error: 'Property is no longer available to re-confirm.' });
          }
          property.availability = 'Booked';
          await property.save();
        }
      }
    }

    booking.lead_id = lead_id || booking.lead_id;
    booking.property_id = property_id || booking.property_id;
    booking.status = status || booking.status;
    await booking.save();
    
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update booking' });
  }
});

// DELETE booking
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Restore property to Available
    const property = await Property.findByPk(booking.property_id);
    if (property) {
      property.availability = 'Available';
      await property.save();
    }

    await booking.destroy();
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router;
