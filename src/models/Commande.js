const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Commande = sequelize.define('Commande', {
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
      type: DataTypes.ENUM('achat', 'transfert', 'retour'),
      allowNull: false
    },
    dateCommande: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    dateLivraisonPrevue: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dateLivraisonEffective: {
      type: DataTypes.DATE,
      allowNull: true
    },
    etat: {
      type: DataTypes.ENUM('en_cours', 'recue_partiellement', 'complete', 'annulee'),
      defaultValue: 'en_cours'
    },
    fournisseur: {
      type: DataTypes.STRING,
      allowNull: true
    },
    montantTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    documentsAssocies: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Liste des documents liés (bons de livraison, factures, etc.)'
    },
    alertes: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuration des alertes de suivi'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    hooks: {
      beforeUpdate: (commande) => {
        if (commande.changed('etat')) {
          // Mise à jour de la date de livraison effective si la commande est complète
          if (commande.etat === 'complete' && !commande.dateLivraisonEffective) {
            commande.dateLivraisonEffective = new Date();
          }
        }
      }
    }
  });

  Commande.associate = (models) => {
    Commande.belongsTo(models.Client);
    Commande.belongsTo(models.User, { as: 'createdBy' });
    Commande.belongsTo(models.User, { as: 'validatedBy' });
    Commande.belongsToMany(models.NonSY, { through: 'CommandeNonSY' });
    Commande.belongsToMany(models.EISE, { through: 'CommandeEISE' });
    Commande.belongsToMany(models.ESTI, { through: 'CommandeESTI' });
    Commande.belongsToMany(models.Touret, { through: 'CommandeTouret' });
    Commande.hasOne(models.Voyage);
  };

  return Commande;
};