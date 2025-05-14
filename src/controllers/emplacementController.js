const { Emplacement } = require('../models');
const { Op } = require('sequelize');

// Créer un nouvel emplacement
exports.create = async (req, res) => {
  try {
    const emplacement = await Emplacement.create(req.body);
    res.status(201).json(emplacement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupérer tous les emplacements avec filtres optionnels
exports.findAll = async (req, res) => {
  try {
    const { reference, zone, type, tauxOccupationMin, tauxOccupationMax } = req.query;
    const where = {};

    if (reference) where.reference = { [Op.like]: `%${reference}%` };
    if (zone) where.zone = zone;
    if (type) where.type = type;

    if (tauxOccupationMin || tauxOccupationMax) {
      where.tauxOccupation = {};
      if (tauxOccupationMin) where.tauxOccupation[Op.gte] = parseFloat(tauxOccupationMin);
      if (tauxOccupationMax) where.tauxOccupation[Op.lte] = parseFloat(tauxOccupationMax);
    }

    const emplacements = await Emplacement.findAll({
      where,
      include: ['Client'],
      order: [['zone', 'ASC'], ['allee', 'ASC'], ['travee', 'ASC'], ['niveau', 'ASC']]
    });

    res.json(emplacements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un emplacement par son ID
exports.findOne = async (req, res) => {
  try {
    const emplacement = await Emplacement.findByPk(req.params.id, {
      include: ['Client', 'NonSY', 'EISE', 'ESTI', 'Touret']
    });

    if (!emplacement) {
      return res.status(404).json({ message: 'Emplacement non trouvé' });
    }

    res.json(emplacement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un emplacement
exports.update = async (req, res) => {
  try {
    const emplacement = await Emplacement.findByPk(req.params.id);

    if (!emplacement) {
      return res.status(404).json({ message: 'Emplacement non trouvé' });
    }

    await emplacement.update(req.body);
    res.json(emplacement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un emplacement
exports.delete = async (req, res) => {
  try {
    const emplacement = await Emplacement.findByPk(req.params.id);

    if (!emplacement) {
      return res.status(404).json({ message: 'Emplacement non trouvé' });
    }

    await emplacement.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rechercher des emplacements par critères avancés
exports.search = async (req, res) => {
  try {
    const { query, type, disponible } = req.query;
    const where = {};

    if (query) {
      where[Op.or] = [
        { reference: { [Op.like]: `%${query}%` } },
        { zone: { [Op.like]: `%${query}%` } },
        { allee: { [Op.like]: `%${query}%` } },
        { travee: { [Op.like]: `%${query}%` } }
      ];
    }

    if (type) where.type = type;
    if (disponible === 'true') {
      where.tauxOccupation = {
        [Op.lt]: 100
      };
    }

    const emplacements = await Emplacement.findAll({
      where,
      include: ['Client'],
      order: [['zone', 'ASC'], ['allee', 'ASC'], ['travee', 'ASC'], ['niveau', 'ASC']]
    });

    res.json(emplacements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les emplacements disponibles par type
exports.getDisponibles = async (req, res) => {
  try {
    const { type } = req.query;
    const where = {
      tauxOccupation: {
        [Op.lt]: 100
      }
    };

    if (type) where.type = type;

    const emplacements = await Emplacement.findAll({
      where,
      order: [['tauxOccupation', 'ASC']]
    });

    res.json(emplacements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les statistiques d'occupation
exports.getStatistiques = async (req, res) => {
  try {
    const stats = await Emplacement.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('AVG', sequelize.col('tauxOccupation')), 'tauxOccupationMoyen']
      ],
      group: ['type']
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};