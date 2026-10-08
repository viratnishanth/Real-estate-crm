const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// POST Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        name: user.name
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

const authMiddleware = require('../middleware/authMiddleware');

// POST Register (Temporary endpoint to create first admin user)
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password_hash,
      role: role || 'SALES'
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST Impersonate Employee
router.post('/impersonate/:id', authMiddleware, async (req, res) => {
  try {
    // Check if the requester is an ADMIN
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can impersonate employees.' });
    }

    const targetUser = await User.findByPk(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    // Return jsonwebtoken for the target user
    const payload = {
      user: {
        id: targetUser.id,
        role: targetUser.role,
        name: targetUser.name
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: targetUser.id, name: targetUser.name, email: targetUser.email, role: targetUser.role } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST Dev Switch Role (For testing toggle button)
router.post('/dev-switch-role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    
    const targetUser = await User.findByPk(req.user.id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // We don't actually change the DB, we just issue a new token with the requested role
    const payload = {
      user: {
        id: targetUser.id,
        role: role, // Use the requested role
        name: role === 'ADMIN' ? 'Admin User' : 'Employee'
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { 
            id: targetUser.id, 
            name: payload.user.name, 
            email: role === 'ADMIN' ? targetUser.email : 'employee@realestate.com', 
            role: role 
          } 
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT Update Profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Demo Employee accounts cannot modify the admin profile settings.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Create a new token with updated payload
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        name: user.name
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
