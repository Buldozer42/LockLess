const Booking = require('../entity/booking');
const User = require('../entity/user');
const Locker = require('../entity/locker');
const { connectDB } = require('../service/db');

/**
 * Create and load booking fixtures into the database
 * : npm run fixtures:bookings
 */
async function loadBookingFixtures() {
  try {
    await connectDB();
    
    // Vider la collection des réservations
    await Booking.deleteMany({});
    
    // Récupérer les utilisateurs et casiers existants
    const users = await User.find({});
    const lockers = await Locker.find({});
    
    // Vérifier si nous avons des utilisateurs et des casiers
    if (users.length === 0 || lockers.length === 0) {
      console.log('Aucun utilisateur ou casier trouvé. Veuillez exécuter les fixtures correspondantes d\'abord.');
      return [];
    }
    
    // Date actuelle pour générer des dates relatives
    const now = new Date();
    
    // Créer quelques réservations avec des dates relatives
    const bookings = [
      {
        ownerId: users[0]._id, // John Doe
        lockerId: lockers.find(l => l.number === 'A001')._id,
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5), // 5 jours avant aujourd'hui
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5)    // 5 jours après aujourd'hui
      },
      {
        ownerId: users[1]._id, // Jane Smith
        lockerId: lockers.find(l => l.number === 'B001')._id,
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),     // Aujourd'hui
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10)   // 10 jours après aujourd'hui
      },
      {
        ownerId: users[3]._id, // Marie Dupont
        lockerId: lockers.find(l => l.number === 'C001')._id,
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2), // 2 jours après aujourd'hui
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)    // 7 jours après aujourd'hui
      },
      {
        ownerId: users[2]._id, // Admin
        lockerId: lockers.find(l => l.number === 'B002')._id,
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10), // 10 jours avant aujourd'hui
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2)     // 2 jours avant aujourd'hui (réservation passée)
      }
    ];
    
    // Mettre à jour les casiers pour refléter l'état de réservation
    // Les réservations en cours ou à venir correspondent à des casiers réservés
    for (const booking of bookings) {
      if (booking.endDate > now) {
        const locker = await Locker.findById(booking.lockerId);
        if (locker) {
          locker.state = 'reserved';
          await locker.save();
        }
      }
    }
    
    // Insérer les réservations
    await Booking.insertMany(bookings);
    
    return bookings;
  } catch (error) {
    console.error('Erreur lors du chargement des fixtures de réservations :', error);
    throw error;
  }
}

if (require.main === module) {
  loadBookingFixtures()
    .then(() => {
      console.log('Fixtures des réservations chargées avec succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('Erreur lors du chargement des fixtures des réservations :', error);
      process.exit(1);
    });
}

module.exports = { loadBookingFixtures };
