const express = require('express');
const router = express.Router();
const { Lead } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// GET all leads (ADMIN sees all, SALES sees only their assigned leads)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let whereClause = {};
    
    // If the user is SALES, they only see leads assigned to them (using user ID or name)
    // Assuming assigned_to in DB maps to the user's name or ID. For now, matching assigned_to with user name.
    if (req.user.role === 'SALES' || req.user.role === 'SALES_EMPLOYEE') {
      whereClause.assigned_to = req.user.name; // In production, usually mapped by user_id
    }

    const leads = await Lead.findAll({ 
      where: whereClause,
      order: [['createdAt', 'DESC']] 
    });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// POST new lead (ADMIN can create anywhere, SALES can only create for themselves)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // If user is SALES, auto-assign the lead to them to prevent them creating leads for others
    if (req.user.role === 'SALES' || req.user.role === 'SALES_EMPLOYEE') {
      req.body.assigned_to = req.user.name;
    }
    
    const newLead = await Lead.create(req.body);
    res.status(201).json(newLead);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create lead', details: err });
  }
});

// PUT update lead
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the lead exists and belongs to the user if they are SALES
    const lead = await Lead.findByPk(id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    if ((req.user.role === 'SALES' || req.user.role === 'SALES_EMPLOYEE') && lead.assigned_to !== req.user.name) {
      return res.status(403).json({ error: 'You can only edit your own assigned leads' });
    }

    await Lead.update(req.body, { where: { id } });
    const updatedLead = await Lead.findByPk(id);
    res.json(updatedLead);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update lead' });
  }
});

// DELETE lead
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the lead exists and belongs to the user if they are SALES
    const lead = await Lead.findByPk(id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    if ((req.user.role === 'SALES' || req.user.role === 'SALES_EMPLOYEE') && lead.assigned_to !== req.user.name) {
      return res.status(403).json({ error: 'You can only delete your own assigned leads' });
    }

    await lead.destroy();
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// POST bulk delete leads
router.post('/bulk-delete', authMiddleware, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { leadIds } = req.body;
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ error: 'No lead IDs provided' });
    }
    
    await Lead.destroy({
      where: {
        id: leadIds
      }
    });
    
    res.json({ message: `${leadIds.length} leads deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk delete leads' });
  }
});

// POST bulk assign leads
router.post('/bulk-assign', authMiddleware, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { leadIds, assigned_to } = req.body;
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ error: 'No lead IDs provided' });
    }
    
    await Lead.update(
      { assigned_to: assigned_to },
      { where: { id: leadIds } }
    );
    
    res.json({ message: `${leadIds.length} leads assigned to ${assigned_to} successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk assign leads' });
  }
});

module.exports = router;
