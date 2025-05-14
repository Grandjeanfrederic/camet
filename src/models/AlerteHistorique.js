const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AlerteHistorique extends Model {
    static associate(models) {
      AlerteHistorique.belongsTo(models.NonSY, {
        foreignKey: 'produitId',
        constraints: false,
        as: 'NonSY'
      });
      AlerteHistorique.belongsTo(models.EISE, {
        foreignKey: 'produitId',
        constraints: false,
        as: 'EISE'
      });
      AlerteHistorique.belongsTo(models.ESTI, {
        foreignKey: 'produitId',
        constraints: false,
        as: 'ESTI'
      });
      AlerteHistorique.belongsTo(models.Touret, {
        foreignKey: 'produitId',
        constraints: false,
        as: 'Touret'
      });
    }
  }

  AlerteHistorique.init({
    type: {
      type: DataTypes.ENUM('NonSY', 'EISE', 'ESTI', 'Touret'),
      allowNull: false
    },
    produitId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    seuilMin: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    seuilMax: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'AlerteHistorique',
    tableName: 'alerte_historiques'
  });

  return AlerteHistorique;
};