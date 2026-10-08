const express = require('express');
const router = express.Router();
const { User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const bcrypt = require('bcryptjs');

// GET all employees (excluding ADMIN maybe, or include all?)
// Let's include all SALES employees for the management page
router.get('/', authMiddleware, async (req, res) => {
  try {
    const employees = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// POST create employee
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, email, phone, role, status, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password || 'password123', salt);

    const newUser = await User.create({
      name,
      email,
      phone,
      role: role || 'SALES',
      status: status || 'Active',
      password_hash
    });

    // Don't send password hash back
    const userWithoutPassword = newUser.toJSON();
    delete userWithoutPassword.password_hash;
    
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create employee' });
  }
});

// PUT update employee status or details
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status, password } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (status) user.status = status;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(password, salt);
    }

    await user.save();
    
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password_hash;

    res.json(userWithoutPassword);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update employee' });
  }
});

// DELETE employee
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // In a real app, maybe we shouldn't delete users who have booked properties.
    // For now, we allow it.
    await user.destroy();
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete employee' });
  }
});

module.exports = router;
