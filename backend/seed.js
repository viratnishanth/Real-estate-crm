const { User, sequelize } = require('./models');
const bcrypt = require('bcryptjs');

async function seedUser() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Ensure table exists
    await User.sync();

    const email = 'admin@crm.com';
    const password = '123456';
    
    let user = await User.findOne({ where: { email } });
    if (user) {
      console.log('User already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await User.create({
      name: 'Admin',
      email,
      password_hash,
      role: 'ADMIN'
    });

    console.log('✅ Admin user created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Unable to create user:', error);
    process.exit(1);
  }
}

seedUser();
