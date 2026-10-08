const express = require('express');
const router = express.Router();
const { Property } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// GET all properties (Accessible by both ADMIN and SALES)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const properties = await Property.findAll({ order: [['createdAt', 'DESC']] });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// POST new property (ADMIN only)
router.post('/', authMiddleware, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const newProperty = await Property.create(req.body);
    res.status(201).json(newProperty);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create property', details: err });
  }
});

// PUT update property (ADMIN only)
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Property.update(req.body, { where: { id } });
    if (updated) {
      const updatedProperty = await Property.findByPk(id);
      return res.json(updatedProperty);
    }
    throw new Error('Property not found');
  } catch (err) {
    res.status(400).json({ error: 'Failed to update property' });
  }
});
// DELETE property (ADMIN only)
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Property.destroy({ where: { id } });
    if (deleted) {
      return res.json({ message: 'Property deleted successfully' });
    }
    throw new Error('Property not found');
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete property' });
  }
});

module.exports = router;
