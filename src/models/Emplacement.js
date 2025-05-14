const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Emplacement = sequelize.define('Emplacement', {
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
    zone: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Zone de stockage (ex: A, B, C)'
    },
    allee: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Numéro d\'allée'
    },
    travee: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Numéro de travée'
    },
    niveau: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Niveau de stockage'
    },
    type: {
      type: DataTypes.ENUM('standard', 'securise', 'refrigere', 'exterieur'),
      defaultValue: 'standard'
    },
    capaciteVolume: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Capacité en volume (m3)'
    },
    capacitePoids: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Capacité en poids (kg)'
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Température de conservation requise (°C)'
    },
    tauxOccupation: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Taux d\'occupation en pourcentage'
    },
    restrictions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Restrictions spécifiques (ex: matières dangereuses)'
    },
    derniereInspection: {
      type: DataTypes.DATE,
      allowNull: true
    },
    prochaineInspection: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    hooks: {
      beforeUpdate: (emplacement) => {
        // Mise à jour automatique du taux d'occupation
        if (emplacement.changed('tauxOccupation')) {
          // Logique de calcul du taux d'occupation
        }
      }
    }
  });

  Emplacement.associate = (models) => {
    Emplacement.hasMany(models.NonSY);
    Emplacement.hasMany(models.EISE);
    Emplacement.hasMany(models.ESTI);
    Emplacement.hasMany(models.Touret);
    Emplacement.belongsTo(models.Client);
  };

  return Emplacement;
};