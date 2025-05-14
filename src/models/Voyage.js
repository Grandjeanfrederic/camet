const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Voyage = sequelize.define('Voyage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM('livraison', 'transfert', 'retour'),
      allowNull: false
    },
    dateDepart: {
      type: DataTypes.DATE,
      allowNull: false
    },
    dateArriveeEstimee: {
      type: DataTypes.DATE,
      allowNull: false
    },
    dateArriveeEffective: {
      type: DataTypes.DATE,
      allowNull: true
    },
    etat: {
      type: DataTypes.ENUM('planifie', 'en_cours', 'termine', 'annule'),
      defaultValue: 'planifie'
    },
    origine: {
      type: DataTypes.STRING,
      allowNull: false
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false
    },
    transporteur: {
      type: DataTypes.STRING,
      allowNull: true
    },
    documentsTransport: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Documents associés au transport (CMR, bon de livraison, etc.)'
    },
    reglesGroupage: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Règles spécifiques de groupage pour ce voyage'
    },
    poidsTotal: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    volumeTotal: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    hooks: {
      beforeUpdate: (voyage) => {
        if (voyage.changed('etat') && voyage.etat === 'termine') {
          voyage.dateArriveeEffective = new Date();
        }
      }
    }
  });

  Voyage.associate = (models) => {
    Voyage.belongsTo(models.Client, { as: 'clientOrigine' });
    Voyage.belongsTo(models.Client, { as: 'clientDestination' });
    Voyage.belongsTo(models.Commande);
    Voyage.belongsToMany(models.NonSY, { through: 'VoyageNonSY' });
    Voyage.belongsToMany(models.EISE, { through: 'VoyageEISE' });
    Voyage.belongsToMany(models.ESTI, { through: 'VoyageESTI' });
    Voyage.belongsToMany(models.Touret, { through: 'VoyageTouret' });
  };

  return Voyage;
};