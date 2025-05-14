const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');

// Configuration pour les tests
dotenv.config({ path: '.env.test' });

// Configuration de la base de données de test
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
});

// Fonction pour initialiser la base de données de test
async function initializeTestDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données de test:', error);
    throw error;
  }
}

// Fonction pour nettoyer la base de données après les tests
async function clearTestDatabase() {
  try {
    await sequelize.drop();
  } catch (error) {
    console.error('Erreur lors du nettoyage de la base de données de test:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  initializeTestDatabase,
  clearTestDatabase
};