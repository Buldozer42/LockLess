const Locker = require('../entity/locker');
const { connectDB } = require('../service/db');

/**
 * Create and load locker fixtures into the database
 * : npm run fixtures:lockers
 */
async function loadLockerFixtures() {
  try {
    await connectDB();
    await Locker.deleteMany({});
    
    const lockers = [
      {
        number: 'A001',
        size: 'small',
        state: 'available',
        price: 5
      },
      {
        number: 'A002',
        size: 'small',
        state: 'available',
        price: 5
      },
      {
        number: 'B001',
        size: 'medium',
        state: 'available',
        price: 8
      },
      {
        number: 'B002',
        size: 'medium',
        state: 'reserved',
        price: 8
      },
      {
        number: 'C001',
        size: 'large',
        state: 'reserved',
        price: 12
      },
      {
        number: 'C002',
        size: 'large',
        state: 'unavailable',
        price: 12
      }
    ];
    
    await Locker.insertMany(lockers);
    
    return lockers;
  } catch (error) {
    console.error('Erreur lors du chargement des fixtures casiers :', error);
    throw error;
  }
}

if (require.main === module) {
  loadLockerFixtures()
    .then(() => {
      console.log('Fixtures des casiers chargées avec succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('Erreur lors du chargement des fixtures des casiers :', error);
      process.exit(1);
    });
}

module.exports = { loadLockerFixtures };
