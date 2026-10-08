const express = require('express');
const router = express.Router();
const { Lead, Property, Booking } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const { Op } = require('sequelize');

// GET dashboard statistics
router.get('/', authMiddleware, async (req, res) => {
  try {
    const totalLeads = await Lead.count();
    const newLeads = await Lead.count({ where: { stage: 'New' } });
    const siteVisits = await Lead.count({ where: { stage: 'Site Visit' } });
    const interested = await Lead.count({ where: { stage: 'Interested' } });
    const booked = await Lead.count({ where: { stage: 'Booked' } });
    const lost = await Lead.count({ where: { stage: 'Lost' } });

    // Get upcoming follow-ups
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingFollowups = await Lead.findAll({
      where: {
        follow_up_date: {
          [Op.ne]: null
        },
        stage: {
          [Op.notIn]: ['Booked', 'Lost']
        }
      },
      order: [['follow_up_date', 'ASC']],
      attributes: ['id', 'name', 'stage', 'follow_up_date', 'phone']
    });

    res.json({
      totalLeads,
      newLeads,
      siteVisits,
      interested,
      booked,
      lost,
      upcomingFollowups
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
