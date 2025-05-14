const { Touret } = require('../models');
const { Op } = require('sequelize');

// Créer un nouveau touret
exports.create = async (req, res) => {
  try {
    const data = req.body;
    
    // Génération des codes uniques
    data.codeBarres = `TRT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    data.qrCode = `QR-TRT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Initialisation de l'historique
    data.historiqueModifications = [{
      date: new Date(),
      type: 'creation',
      details: 'Création initiale du touret',
      utilisateur: req.user?.id || 'system'
    }];

    const touret = await Touret.create(data);
    res.status(201).json(touret);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupérer tous les tourets avec filtres optionnels
exports.findAll = async (req, res) => {
  try {
    const { reference, designation, etat, type } = req.query;
    const where = {};

    if (reference) where.reference = { [Op.like]: `%${reference}%` };
    if (designation) where.designation = { [Op.like]: `%${designation}%` };
    if (etat) where.etat = etat;
    if (type) where.type = type;

    const tourets = await Touret.findAll({
      where,
      include: ['Client', 'Emplacement'],
      order: [['dateReception', 'DESC']]
    });

    res.json(tourets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un touret par son ID
exports.findOne = async (req, res) => {
  try {
    const touret = await Touret.findByPk(req.params.id, {
      include: ['Client', 'Emplacement', 'Commandes']
    });

    if (!touret) {
      return res.status(404).json({ message: 'Touret non trouvé' });
    }

    res.json(touret);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un touret
exports.update = async (req, res) => {
  try {
    const touret = await Touret.findByPk(req.params.id);

    if (!touret) {
      return res.status(404).json({ message: 'Touret non trouvé' });
    }

    // Enregistrement des modifications dans l'historique
    const modifications = touret.historiqueModifications || [];
    modifications.push({
      date: new Date(),
      type: 'modification',
      details: 'Mise à jour des informations du touret',
      modifications: Object.keys(req.body).map(key => ({
        champ: key,
        ancienneValeur: touret[key],
        nouvelleValeur: req.body[key]
      })),
      utilisateur: req.user?.id || 'system'
    });

    req.body.historiqueModifications = modifications;

    await touret.update(req.body);
    res.json(touret);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un touret
exports.delete = async (req, res) => {
  try {
    const touret = await Touret.findByPk(req.params.id);

    if (!touret) {
      return res.status(404).json({ message: 'Touret non trouvé' });
    }

    await touret.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rechercher des tourets par critères avancés
exports.search = async (req, res) => {
  try {
    const { query, dateReceptionDebut, dateReceptionFin, client } = req.query;
    const where = {};

    if (query) {
      where[Op.or] = [
        { reference: { [Op.like]: `%${query}%` } },
        { designation: { [Op.like]: `%${query}%` } },
        { contenu: { [Op.like]: `%${query}%` } }
      ];
    }

    if (dateReceptionDebut && dateReceptionFin) {
      where.dateReception = {
        [Op.between]: [new Date(dateReceptionDebut), new Date(dateReceptionFin)]
      };
    }

    if (client) where.ClientId = client;

    const tourets = await Touret.findAll({
      where,
      include: ['Client', 'Emplacement'],
      order: [['dateReception', 'DESC']]
    });

    res.json(tourets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour la maintenance d'un touret
exports.updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateMaintenance, type, description, couts } = req.body;

    const touret = await Touret.findByPk(id);
    if (!touret) {
      return res.status(404).json({ message: 'Touret non trouvé' });
    }

    // Mise à jour des dates de maintenance
    const derniereMaintenance = new Date(dateMaintenance);
    const prochaineMaintenance = new Date(dateMaintenance);
    prochaineMaintenance.setMonth(prochaineMaintenance.getMonth() + 6); // Maintenance tous les 6 mois par défaut

    await touret.update({
      derniereMaintenance,
      prochaineMaintenance,
      notes: `${touret.notes}\nMaintenance du ${dateMaintenance}: ${description}`
    });

    res.json(touret);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir les tourets nécessitant une maintenance
exports.getMaintenanceRequise = async (req, res) => {
  try {
    const dateReference = new Date();
    dateReference.setDate(dateReference.getDate() + 30); // Maintenance à effectuer dans les 30 jours

    const tourets = await Touret.findAll({
      where: {
        prochaineMaintenance: {
          [Op.lte]: dateReference
        },
        etat: {
          [Op.not]: ['hors_service']
        }
      },
      include: ['Client', 'Emplacement'],
      order: [['prochaineMaintenance', 'ASC']]
    });

    res.json(tourets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour le statut d'un touret (vide/chargé)
exports.updateStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const { etat, contenu } = req.body;

    const touret = await Touret.findByPk(id);
    if (!touret) {
      return res.status(404).json({ message: 'Touret non trouvé' });
    }

    await touret.update({
      etat,
      contenu,
      nombreRotations: etat === 'vide' ? touret.nombreRotations + 1 : touret.nombreRotations
    });

    res.json(touret);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir les statistiques d'utilisation des tourets
exports.getStatistiques = async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;
    const where = {};

    if (dateDebut && dateFin) {
      where.dateReception = {
        [Op.between]: [new Date(dateDebut), new Date(dateFin)]
      };
    }

    const tourets = await Touret.findAll({ where });

    const statistiques = {
      total: tourets.length,
      parEtat: {
        vide: tourets.filter(t => t.etat === 'vide').length,
        charge: tourets.filter(t => t.etat === 'charge').length,
        en_transit: tourets.filter(t => t.etat === 'en_transit').length,
        en_maintenance: tourets.filter(t => t.etat === 'en_maintenance').length
      },
      rotationMoyenne: tourets.reduce((acc, t) => acc + t.nombreRotations, 0) / tourets.length || 0
    };

    res.json(statistiques);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};