const { Voyage, Commande } = require('../models');
const { Op } = require('sequelize');

// Créer un nouveau voyage
exports.create = async (req, res) => {
  try {
    const voyage = await Voyage.create(req.body);
    res.status(201).json(voyage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupérer tous les voyages avec filtres optionnels
exports.findAll = async (req, res) => {
  try {
    const { reference, statut, dateDebut, dateFin } = req.query;
    const where = {};

    if (reference) where.reference = { [Op.like]: `%${reference}%` };
    if (statut) where.statut = statut;
    if (dateDebut && dateFin) {
      where.dateDepart = {
        [Op.between]: [new Date(dateDebut), new Date(dateFin)]
      };
    }

    const voyages = await Voyage.findAll({
      where,
      include: ['Commandes'],
      order: [['dateDepart', 'DESC']]
    });

    res.json(voyages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un voyage par son ID
exports.findOne = async (req, res) => {
  try {
    const voyage = await Voyage.findByPk(req.params.id, {
      include: ['Commandes']
    });

    if (!voyage) {
      return res.status(404).json({ message: 'Voyage non trouvé' });
    }

    res.json(voyage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un voyage
exports.update = async (req, res) => {
  try {
    const voyage = await Voyage.findByPk(req.params.id);

    if (!voyage) {
      return res.status(404).json({ message: 'Voyage non trouvé' });
    }

    await voyage.update(req.body);
    res.json(voyage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un voyage
exports.delete = async (req, res) => {
  try {
    const voyage = await Voyage.findByPk(req.params.id);

    if (!voyage) {
      return res.status(404).json({ message: 'Voyage non trouvé' });
    }

    await voyage.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rechercher des voyages par critères avancés
exports.search = async (req, res) => {
  try {
    const { query, statut, dateDebut, dateFin } = req.query;
    const where = {};

    if (query) {
      where[Op.or] = [
        { reference: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ];
    }

    if (statut) where.statut = statut;

    if (dateDebut && dateFin) {
      where.dateDepart = {
        [Op.between]: [new Date(dateDebut), new Date(dateFin)]
      };
    }

    const voyages = await Voyage.findAll({
      where,
      include: ['Commandes'],
      order: [['dateDepart', 'DESC']]
    });

    res.json(voyages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour le statut d'un voyage
exports.updateStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, notes } = req.body;

    const voyage = await Voyage.findByPk(id);
    if (!voyage) {
      return res.status(404).json({ message: 'Voyage non trouvé' });
    }

    await voyage.update({
      statut,
      notes: notes ? `${voyage.notes}\nMise à jour du statut: ${statut} - ${notes}` : voyage.notes
    });

    res.json(voyage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir les statistiques des voyages
exports.getStatistiques = async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;
    const where = {};

    if (dateDebut && dateFin) {
      where.dateDepart = {
        [Op.between]: [new Date(dateDebut), new Date(dateFin)]
      };
    }

    const stats = await Voyage.findAll({
      where,
      attributes: [
        'statut',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('AVG', sequelize.col('dureeTrajet')), 'dureeMoyenne']
      ],
      group: ['statut']
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};