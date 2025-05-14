const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Touret = sequelize.define('Touret', {
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
    designation: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('touret', 'non_touret'),
      allowNull: false,
      defaultValue: 'touret'
    },
    diametre: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    largeur: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    hauteur: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    poids: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    capacite: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Capacité maximale en mètres ou kg'
    },
    etat: {
      type: DataTypes.ENUM('vide', 'charge', 'en_transit', 'en_maintenance'),
      defaultValue: 'vide'
    },
    contenu: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Description du contenu actuel'
    },
    dateReception: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    derniereMaintenance: {
      type: DataTypes.DATE,
      allowNull: true
    },
    prochaineMaintenance: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nombreRotations: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Nombre de cycles d\'utilisation'
    },
    consigne: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Montant de la consigne'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codeBarres: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    qrCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    historiqueModifications: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    }
  }, {
    timestamps: true,
    hooks: {
      beforeUpdate: (touret) => {
        if (touret.changed('etat') && touret.etat === 'vide') {
          touret.nombreRotations += 1;
        }
      }
    }
  });

  Touret.associate = (models) => {
    Touret.belongsTo(models.Client);
    Touret.belongsTo(models.Emplacement);
    Touret.hasMany(models.Commande);
  };

  return Touret;
};