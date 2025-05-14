const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NonSY = sequelize.define('NonSY', {
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
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    unite: {
      type: DataTypes.STRING,
      allowNull: false
    },
    poids: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    volume: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    dateReception: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    emplacement: {
      type: DataTypes.STRING,
      allowNull: true
    },
    etat: {
      type: DataTypes.ENUM('disponible', 'reserve', 'en_preparation', 'expedie'),
      defaultValue: 'disponible'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    datePeremption: {
      type: DataTypes.DATE,
      allowNull: true
    },
    alertePeremption: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    seuilAlertePeremption: {
      type: DataTypes.INTEGER, // en jours
      allowNull: true,
      defaultValue: 30 // Alerte 30 jours avant péremption par défaut
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
    }
  }, {
    timestamps: true
  });

  NonSY.associate = (models) => {
    NonSY.belongsTo(models.Emplacement);
    NonSY.belongsTo(models.Client);
    NonSY.hasMany(models.Commande);
  };

  return NonSY;
};