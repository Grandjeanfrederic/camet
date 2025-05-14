const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Modèles
const models = {
  NonSY: require('./NonSY')(sequelize),
  EISE: require('./EISE')(sequelize),
  ESTI: require('./ESTI')(sequelize),
  Touret: require('./Touret')(sequelize),
  Commande: require('./Commande')(sequelize),
  Voyage: require('./Voyage')(sequelize),
  Emplacement: require('./Emplacement')(sequelize),
  Client: require('./Client')(sequelize),
  User: require('./User')(sequelize)
};

// Associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;