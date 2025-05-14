const { Emplacement, NonSY, EISE, ESTI, Touret } = require('../models');
const { Op } = require('sequelize');

// Définir les seuils d'alerte pour un type de produit
exports.definirSeuils = async (req, res) => {
  try {
    const { type, seuilMin, seuilMax, produitId, produitType } = req.body;
    
    let produit;
    switch (produitType) {
      case 'NonSY':
        produit = await NonSY.findByPk(produitId);
        break;
      case 'EISE':
        produit = await EISE.findByPk(produitId);
        break;
      case 'ESTI':
        produit = await ESTI.findByPk(produitId);
        break;
      case 'Touret':
        produit = await Touret.findByPk(produitId);
        break;
      default:
        return res.status(400).json({ message: 'Type de produit invalide' });
    }

    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    await produit.update({
      seuilAlerteMin: seuilMin,
      seuilAlerteMax: seuilMax
    });

    res.json(produit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Vérifier les alertes de stock
exports.verifierAlertes = async (req, res) => {
  try {
    const alertes = [];

    // Vérifier les NonSY
    const nonSYs = await NonSY.findAll({
      where: {
        [Op.or]: [
          {
            quantite: { [Op.lte]: sequelize.col('seuilAlerteMin') }
          },
          {
            quantite: { [Op.gte]: sequelize.col('seuilAlerteMax') }
          }
        ]
      },
      include: ['Emplacement']
    });

    nonSYs.forEach(nonSY => {
      alertes.push({
        type: 'NonSY',
        reference: nonSY.reference,
        quantite: nonSY.quantite,
        seuilMin: nonSY.seuilAlerteMin,
        seuilMax: nonSY.seuilAlerteMax,
        emplacement: nonSY.Emplacement?.reference || 'Non assigné'
      });
    });

    // Vérifier les EISE
    const eises = await EISE.findAll({
      where: {
        [Op.or]: [
          {
            quantite: { [Op.lte]: sequelize.col('seuilAlerteMin') }
          },
          {
            quantite: { [Op.gte]: sequelize.col('seuilAlerteMax') }
          }
        ]
      },
      include: ['Emplacement']
    });

    eises.forEach(eise => {
      alertes.push({
        type: 'EISE',
        reference: eise.reference,
        quantite: eise.quantite,
        seuilMin: eise.seuilAlerteMin,
        seuilMax: eise.seuilAlerteMax,
        emplacement: eise.Emplacement?.reference || 'Non assigné'
      });
    });

    // Vérifier les ESTI
    const estis = await ESTI.findAll({
      where: {
        [Op.or]: [
          {
            quantite: { [Op.lte]: sequelize.col('seuilAlerteMin') }
          },
          {
            quantite: { [Op.gte]: sequelize.col('seuilAlerteMax') }
          }
        ]
      },
      include: ['Emplacement']
    });

    estis.forEach(esti => {
      alertes.push({
        type: 'ESTI',
        reference: esti.reference,
        quantite: esti.quantite,
        seuilMin: esti.seuilAlerteMin,
        seuilMax: esti.seuilAlerteMax,
        emplacement: esti.Emplacement?.reference || 'Non assigné'
      });
    });

    res.json(alertes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir l'historique des alertes
exports.getHistoriqueAlertes = async (req, res) => {
  try {
    const { dateDebut, dateFin, type } = req.query;
    const where = {};

    if (dateDebut && dateFin) {
      where.createdAt = {
        [Op.between]: [new Date(dateDebut), new Date(dateFin)]
      };
    }

    if (type) where.type = type;

    const historique = await AlerteHistorique.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: ['Produit']
    });

    res.json(historique);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};