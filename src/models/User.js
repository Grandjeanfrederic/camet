const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'operateur', 'preparateur', 'consultant'),
      defaultValue: 'operateur'
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Permissions spécifiques de l\'utilisateur'
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prenom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dernierLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actif: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    tentativesConnexion: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    dateVerrouillage: {
      type: DataTypes.DATE,
      allowNull: true
    },
    facteurAuthentification: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Activation de l\'authentification à deux facteurs'
    },
    secretMFA: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['password', 'secretMFA'] }
    }
  });

  User.prototype.verifyPassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  User.associate = (models) => {
    User.belongsTo(models.Client);
    User.hasMany(models.Commande, { foreignKey: 'createdById' });
    User.hasMany(models.Commande, { foreignKey: 'validatedById' });
  };

  return User;
};