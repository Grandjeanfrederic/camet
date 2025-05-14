const { Commande, Voyage } = require('../models');
const { Op } = require('sequelize');

// Créer une nouvelle commande
exports.create = async (req, res) => {
  try {
    const commande = await Commande.create(req.body);
    res.status(201).json(commande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupérer toutes les commandes avec filtres optionnels
exports.findAll = async (req, res) => {
  try {
    const { reference, statut, dateDebut, dateFin } = req.query;
    const where = {};

    if (reference) where.reference = { [Op.like]: `%${reference}%` };
    if (statut) where.statut = statut;
    if (dateDebut && dateFin) {
      where.dateCommande = {
        [Op.between]: [new Date(dateDebut), new Date(dateFin)]
      };
    }

    const commandes = await Commande.findAll({
      where,
      include: ['Client', 'Produits', 'Voyage'],
      order: [['dateCommande', 'DESC']]
    });

    res.json(commandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer une commande par son ID
exports.findOne = async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id, {
      include: ['Client', 'Produits', 'Voyage']
    });

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    res.json(commande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une commande
exports.update = async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id);

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    await commande.update(req.body);
    res.json(commande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une commande
exports.delete = async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id);

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    await commande.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rechercher des commandes par critères avancés
exports.search = async (req, res) => {
  try {
    const { query, client, produit, statut, dateDebut, dateFin } = req.query;
    const where = {};

    if (query) {
      where[Op.or] = [
        { reference: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ];
    }

    if (client) where.ClientId = client;
    if (statut) where.statut = statut;

    if (dateDebut && dateFin) {
      where.dateCommande = {
        [Op.between]: [new Date(dateDebut), new Date(dateFin)]
      };
    }

    const commandes = await Commande.findAll({
      where,
      include: [
        'Client',
        {
          model: Produit,
          where: produit ? { id: produit } : undefined
        },
        'Voyage'
      ],
      order: [['dateCommande', 'DESC']]
    });

    res.json(commandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour le statut d'une commande
exports.updateStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, notes } = req.body;

    const commande = await Commande.findByPk(id);
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    await commande.update({
      statut,
      notes: notes ? `${commande.notes}\nMise à jour du statut: ${statut} - ${notes}` : commande.notes
    });

    res.json(commande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Assigner un voyage à une commande
exports.assignerVoyage = async (req, res) => {
  try {
    const { id } = req.params;
    const { voyageId } = req.body;

    const commande = await Commande.findByPk(id);
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    await commande.update({ VoyageId: voyageId });
    
    const updatedCommande = await Commande.findByPk(id, {
      include: ['Voyage']
    });

    res.json(updatedCommande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir les statistiques des commandes
exports.getStatistiques = async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;
    const where = {};

    if (dateDebut && dateFin) {
      where.dateCommande = {
        [Op.between]: [new Date(dateDebut), new Date(dateFin)]
      };
    }

    const stats = await Commande.findAll({
      where,
      attributes: [
        'statut',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.col('montantTotal')), 'montantTotal']
      ],
      group: ['statut']
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};