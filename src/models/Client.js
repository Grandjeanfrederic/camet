const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Client = sequelize.define('Client', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    raisonSociale: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('groupe', 'entite', 'site', 'chantier'),
      allowNull: false
    },
    adresse: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codePostal: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ville: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pays: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'France'
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    conditionsLogistiques: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Conditions spécifiques de livraison, stockage, etc.'
    },
    contactPrincipal: {
      type: DataTypes.STRING,
      allowNull: true
    },
    statut: {
      type: DataTypes.ENUM('actif', 'inactif', 'suspendu'),
      defaultValue: 'actif'
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Clients',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: (client) => {
        // Logique de validation de la hiérarchie
        if (client.type === 'site' && !client.parentId) {
          throw new Error('Un site doit être rattaché à une entité');
        }
        if (client.type === 'chantier' && !client.parentId) {
          throw new Error('Un chantier doit être rattaché à un site');
        }
      }
    }
  });

  Client.associate = (models) => {
    Client.hasMany(models.NonSY);
    Client.hasMany(models.EISE);
    Client.hasMany(models.ESTI);
    Client.hasMany(models.Touret);
    Client.hasMany(models.Commande);
    Client.hasMany(models.Emplacement);
    Client.belongsTo(models.Client, { as: 'parent', foreignKey: 'parentId' });
    Client.hasMany(models.Client, { as: 'enfants', foreignKey: 'parentId' });
  };

  return Client;
};