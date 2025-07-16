const bcrypt = require('bcrypt');
const User = require('../entity/user');
const { connectDB } = require('../service/db');

/**
 * Create and load user fixtures into the database
 * : npm run fixtures:users
 */
async function loadUserFixtures() {
  try {
    await connectDB();
    await User.deleteMany({});
    
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('test', saltRounds);
    const users = [
      {
        firstName: 'john',
        lastName: 'DOE',
        email: 'john.doe@example.com',
        password: passwordHash,
        roles: ['user']
      },
      {
        firstName: 'jane',
        lastName: 'SMITH',
        email: 'jane.smith@example.com',
        password: passwordHash,
        roles: ['user']
      },
      {
        firstName: 'admin',
        lastName: 'ADMIN',
        email: 'admin@example.com',
        password: passwordHash,
        roles: ['user', 'admin']
      },
      {
        firstName: 'marie',
        lastName: 'DUPONT',
        email: 'marie.dupont@example.com',
        password: passwordHash,
        roles: ['user']
      }
    ];
    
    await User.insertMany(users);

    return users;
  } catch (error) {
    console.error('Erreur lors du chargement des fixtures utilisateur :', error);
    throw error;
  }
}

if (require.main === module) {
  loadUserFixtures()
    .then(() => {
      console.log('Fixtures chargées avec succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('Erreur lors du chargement des fixtures :', error);
      process.exit(1);
    });
}

module.exports = { loadUserFixtures };
