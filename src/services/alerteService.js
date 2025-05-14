const { NonSY, EISE, ESTI, Touret, AlerteHistorique } = require('../models');
const { Op } = require('sequelize');

// Enregistrer une alerte dans l'historique
async function enregistrerAlerte(produit, type) {
  try {
    let message = '';
    if (produit.quantite <= produit.seuilAlerteMin) {
      message = `Stock bas - Quantité (${produit.quantite}) inférieure au seuil minimum (${produit.seuilAlerteMin})`;
    } else if (produit.quantite >= produit.seuilAlerteMax) {
      message = `Stock élevé - Quantité (${produit.quantite}) supérieure au seuil maximum (${produit.seuilAlerteMax})`;
    } else if (produit.datePeremption && !produit.alertePeremption) {
      const joursAvantPeremption = Math.ceil((produit.datePeremption - new Date()) / (1000 * 60 * 60 * 24));
      if (joursAvantPeremption <= produit.seuilAlertePeremption) {
        message = `Péremption proche - Le produit expire dans ${joursAvantPeremption} jours`;
        await produit.update({ alertePeremption: true });
      }
    }

    await AlerteHistorique.create({
      type,
      produitId: produit.id,
      reference: produit.reference,
      quantite: produit.quantite,
      seuilMin: produit.seuilAlerteMin,
      seuilMax: produit.seuilAlerteMax,
      message
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'alerte:', error);
  }
}

// Vérifier et enregistrer les alertes pour tous les produits
async function verifierEtEnregistrerAlertes() {
  try {
    // Vérifier les NonSY
    const nonSYs = await NonSY.findAll({
      where: {
        [Op.or]: [
          { quantite: { [Op.lte]: sequelize.col('seuilAlerteMin') } },
          { quantite: { [Op.gte]: sequelize.col('seuilAlerteMax') } },
          {
            datePeremption: {
              [Op.not]: null,
              [Op.gte]: new Date(),
              [Op.lte]: sequelize.literal(`DATE_ADD(NOW(), INTERVAL seuilAlertePeremption DAY)`)
            },
            alertePeremption: false
          }
        ]
      }
    });
    for (const nonSY of nonSYs) {
      await enregistrerAlerte(nonSY, 'NonSY');
    }

    // Vérifier les EISE
    const eises = await EISE.findAll({
      where: {
        [Op.or]: [
          { quantite: { [Op.lte]: sequelize.col('seuilAlerteMin') } },
          { quantite: { [Op.gte]: sequelize.col('seuilAlerteMax') } }
        ]
      }
    });
    for (const eise of eises) {
      await enregistrerAlerte(eise, 'EISE');
    }

    // Vérifier les ESTI
    const estis = await ESTI.findAll({
      where: {
        [Op.or]: [
          { quantite: { [Op.lte]: sequelize.col('seuilAlerteMin') } },
          { quantite: { [Op.gte]: sequelize.col('seuilAlerteMax') } }
        ]
      }
    });
    for (const esti of estis) {
      await enregistrerAlerte(esti, 'ESTI');
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des alertes:', error);
  }
}

module.exports = {
  enregistrerAlerte,
  verifierEtEnregistrerAlertes
};