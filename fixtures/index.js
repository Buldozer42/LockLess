const { loadUserFixtures } = require('./userFixtures');

/**
 * Load all fixtures for the application.
 */
async function loadAllFixtures() {
  try {
    console.log('Chargement des fixtures utilisateurs...');
    await loadUserFixtures();
    
    console.log('Toutes les fixtures ont été chargées avec succès');
  } catch (error) {
    console.error('Erreur lors du chargement des fixtures :', error);
    throw error;
  }
}

if (require.main === module) {
  loadAllFixtures()
    .then(() => {
      console.log('Processus de chargement des fixtures terminé');
      process.exit(0);
    })
    .catch(error => {
      console.error('Erreur lors du processus de chargement des fixtures :', error);
      process.exit(1);
    });
}

module.exports = { loadAllFixtures };
