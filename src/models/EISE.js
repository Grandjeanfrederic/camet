const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EISE = sequelize.define('EISE', {
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
      type: DataTypes.STRING,
      allowNull: false
    },
    taille: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dateAcquisition: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    dateExpiration: {
      type: DataTypes.DATE,
      allowNull: false
    },
    dernierControle: {
      type: DataTypes.DATE,
      allowNull: true
    },
    prochainControle: {
      type: DataTypes.DATE,
      allowNull: true
    },
    frequenceControle: {
      type: DataTypes.INTEGER, // en jours
      allowNull: true
    },
    etat: {
      type: DataTypes.ENUM('disponible', 'attribue', 'en_controle', 'perime', 'hors_service'),
      defaultValue: 'disponible'
    },
    utilisateurActuel: {
      type: DataTypes.STRING,
      allowNull: true
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
      beforeCreate: (eise) => {
        if (eise.frequenceControle) {
          const dateControle = new Date(eise.dernierControle || eise.dateAcquisition);
          eise.prochainControle = new Date(dateControle.setDate(dateControle.getDate() + eise.frequenceControle));
        }
      }
    }
  });

  EISE.associate = (models) => {
    EISE.belongsTo(models.Emplacement);
    EISE.belongsTo(models.Client);
    EISE.hasMany(models.Commande);
  };

  return EISE;
};