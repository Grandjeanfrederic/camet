const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ESTI = sequelize.define('ESTI', {
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
    numeroSerie: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fabricant: {
      type: DataTypes.STRING,
      allowNull: true
    },
    modele: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dateInstallation: {
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
    frequenceMaintenance: {
      type: DataTypes.INTEGER, // en jours
      allowNull: true
    },
    etat: {
      type: DataTypes.ENUM('en_service', 'en_maintenance', 'hors_service', 'reserve'),
      defaultValue: 'en_service'
    },
    documentationTechnique: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    historiqueMaintenance: {
      type: DataTypes.JSON,
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
      beforeCreate: (esti) => {
        if (esti.frequenceMaintenance) {
          const dateMaintenance = new Date(esti.derniereMaintenance || esti.dateInstallation);
          esti.prochaineMaintenance = new Date(dateMaintenance.setDate(dateMaintenance.getDate() + esti.frequenceMaintenance));
        }
      }
    }
  });

  ESTI.associate = (models) => {
    ESTI.belongsTo(models.Emplacement);
    ESTI.belongsTo(models.Client);
    ESTI.hasMany(models.Commande);
  };

  return ESTI;
};