const { NonSY } = require('../models');
const { Op } = require('sequelize');

// Créer un nouveau produit Non SY
exports.create = async (req, res) => {
  try {
    const data = req.body;
    
    // Génération des codes uniques
    data.codeBarres = `NSY-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    data.qrCode = `QR-NSY-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Initialisation de l'historique
    data.historiqueModifications = [{
      date: new Date(),
      type: 'creation',
      details: 'Création initiale du produit',
      utilisateur: req.user?.id || 'system'
    }];

    const nonSY = await NonSY.create(data);
    res.status(201).json(nonSY);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupérer tous les produits Non SY avec filtres optionnels
exports.findAll = async (req, res) => {
  try {
    const { reference, designation, etat, emplacement } = req.query;
    const where = {};

    if (reference) where.reference = { [Op.like]: `%${reference}%` };
    if (designation) where.designation = { [Op.like]: `%${designation}%` };
    if (etat) where.etat = etat;
    if (emplacement) where.emplacement = emplacement;

    const nonSYs = await NonSY.findAll({
      where,
      include: ['Client', 'Emplacement'],
      order: [['createdAt', 'DESC']]
    });

    res.json(nonSYs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un produit Non SY par son ID
exports.findOne = async (req, res) => {
  try {
    const nonSY = await NonSY.findByPk(req.params.id, {
      include: ['Client', 'Emplacement', 'Commandes']
    });

    if (!nonSY) {
      return res.status(404).json({ message: 'Produit Non SY non trouvé' });
    }

    res.json(nonSY);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un produit Non SY
exports.update = async (req, res) => {
  try {
    const nonSY = await NonSY.findByPk(req.params.id);

    if (!nonSY) {
      return res.status(404).json({ message: 'Produit Non SY non trouvé' });
    }

    // Réinitialiser l'alerte de péremption si la date de péremption est modifiée
    if (req.body.datePeremption && req.body.datePeremption !== nonSY.datePeremption) {
      req.body.alertePeremption = false;
    }

    // Enregistrement des modifications dans l'historique
    const modifications = nonSY.historiqueModifications || [];
    modifications.push({
      date: new Date(),
      type: 'modification',
      details: 'Mise à jour des informations du produit',
      modifications: Object.keys(req.body).map(key => ({
        champ: key,
        ancienneValeur: nonSY[key],
        nouvelleValeur: req.body[key]
      })),
      utilisateur: req.user?.id || 'system'
    });

    req.body.historiqueModifications = modifications;

    await nonSY.update(req.body);
    res.json(nonSY);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un produit Non SY
exports.delete = async (req, res) => {
  try {
    const nonSY = await NonSY.findByPk(req.params.id);

    if (!nonSY) {
      return res.status(404).json({ message: 'Produit Non SY non trouvé' });
    }

    await nonSY.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rechercher des produits Non SY par critères avancés
exports.search = async (req, res) => {
  try {
    const { query, dateDebut, dateFin, client, quantiteMin, quantiteMax } = req.query;
    const where = {};

    if (query) {
      where[Op.or] = [
        { reference: { [Op.like]: `%${query}%` } },
        { designation: { [Op.like]: `%${query}%` } }
      ];
    }

    if (dateDebut && dateFin) {
      where.dateReception = {
        [Op.between]: [new Date(dateDebut), new Date(dateFin)]
      };
    }

    if (client) where.ClientId = client;

    if (quantiteMin || quantiteMax) {
      where.quantite = {};
      if (quantiteMin) where.quantite[Op.gte] = quantiteMin;
      if (quantiteMax) where.quantite[Op.lte] = quantiteMax;
    }

    const nonSYs = await NonSY.findAll({
      where,
      include: ['Client', 'Emplacement'],
      order: [['createdAt', 'DESC']]
    });

    res.json(nonSYs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour l'emplacement d'un produit Non SY
exports.updateEmplacement = async (req, res) => {
  try {
    const { id } = req.params;
    const { emplacementId } = req.body;

    const nonSY = await NonSY.findByPk(id);
    if (!nonSY) {
      return res.status(404).json({ message: 'Produit Non SY non trouvé' });
    }

    await nonSY.update({ EmplacementId: emplacementId });
    
    const updatedNonSY = await NonSY.findByPk(id, {
      include: ['Emplacement']
    });

    res.json(updatedNonSY);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir l'historique des mouvements d'un produit Non SY
exports.getMovementHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const nonSY = await NonSY.findByPk(id, {
      include: [
        {
          model: Commande,
          include: ['Voyage']
        }
      ]
    });

    if (!nonSY) {
      return res.status(404).json({ message: 'Produit Non SY non trouvé' });
    }

    res.json(nonSY);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};