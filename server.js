require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Real Estate CRM API is running' });
});

// Use Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/employees', require('./routes/employees'));

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Database connected and models synced successfully!');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('❌ Failed to sync database:', err);
});
