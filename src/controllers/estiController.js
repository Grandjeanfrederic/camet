const { ESTI } = require('../models');
const { Op } = require('sequelize');

// Créer un nouvel équipement ESTI
exports.create = async (req, res) => {
  try {
    const data = req.body;
    
    // Génération des codes uniques
    data.codeBarres = `ESTI-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    data.qrCode = `QR-ESTI-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Initialisation de l'historique
    data.historiqueModifications = [{
      date: new Date(),
      type: 'creation',
      details: 'Création initiale de l\'équipement',
      utilisateur: req.user?.id || 'system'
    }];

    const esti = await ESTI.create(data);
    res.status(201).json(esti);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupérer tous les équipements ESTI avec filtres optionnels
exports.findAll = async (req, res) => {
  try {
    const { reference, designation, etat, type } = req.query;
    const where = {};

    if (reference) where.reference = { [Op.like]: `%${reference}%` };
    if (designation) where.designation = { [Op.like]: `%${designation}%` };
    if (etat) where.etat = etat;
    if (type) where.type = type;

    const estis = await ESTI.findAll({
      where,
      include: ['Client', 'Emplacement'],
      order: [['dateInstallation', 'DESC']]
    });

    res.json(estis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un équipement ESTI par son ID
exports.findOne = async (req, res) => {
  try {
    const esti = await ESTI.findByPk(req.params.id, {
      include: ['Client', 'Emplacement', 'Commandes']
    });

    if (!esti) {
      return res.status(404).json({ message: 'Équipement ESTI non trouvé' });
    }

    res.json(esti);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un équipement ESTI
exports.update = async (req, res) => {
  try {
    const esti = await ESTI.findByPk(req.params.id);

    if (!esti) {
      return res.status(404).json({ message: 'Équipement ESTI non trouvé' });
    }

    // Enregistrement des modifications dans l'historique
    const modifications = esti.historiqueModifications || [];
    modifications.push({
      date: new Date(),
      type: 'modification',
      details: 'Mise à jour des informations de l\'équipement',
      modifications: Object.keys(req.body).map(key => ({
        champ: key,
        ancienneValeur: esti[key],
        nouvelleValeur: req.body[key]
      })),
      utilisateur: req.user?.id || 'system'
    });

    req.body.historiqueModifications = modifications;

    await esti.update(req.body);
    res.json(esti);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un équipement ESTI
exports.delete = async (req, res) => {
  try {
    const esti = await ESTI.findByPk(req.params.id);

    if (!esti) {
      return res.status(404).json({ message: 'Équipement ESTI non trouvé' });
    }

    await esti.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rechercher des équipements ESTI par critères avancés
exports.search = async (req, res) => {
  try {
    const { query, dateInstallationDebut, dateInstallationFin, client } = req.query;
    const where = {};

    if (query) {
      where[Op.or] = [
        { reference: { [Op.like]: `%${query}%` } },
        { designation: { [Op.like]: `%${query}%` } },
        { numeroSerie: { [Op.like]: `%${query}%` } },
        { type: { [Op.like]: `%${query}%` } }
      ];
    }

    if (dateInstallationDebut && dateInstallationFin) {
      where.dateInstallation = {
        [Op.between]: [new Date(dateInstallationDebut), new Date(dateInstallationFin)]
      };
    }

    if (client) where.ClientId = client;

    const estis = await ESTI.findAll({
      where,
      include: ['Client', 'Emplacement'],
      order: [['dateInstallation', 'DESC']]
    });

    res.json(estis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour la maintenance d'un équipement ESTI
exports.updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateMaintenance, type, description, couts, technicien } = req.body;

    const esti = await ESTI.findByPk(id);
    if (!esti) {
      return res.status(404).json({ message: 'Équipement ESTI non trouvé' });
    }

    // Mise à jour des dates de maintenance
    const derniereMaintenance = new Date(dateMaintenance);
    const prochaineMaintenance = new Date(dateMaintenance);
    prochaineMaintenance.setDate(prochaineMaintenance.getDate() + esti.frequenceMaintenance);

    // Mise à jour de l'historique de maintenance
    const historique = esti.historiqueMaintenance || [];
    historique.push({
      date: dateMaintenance,
      type,
      description,
      couts,
      technicien
    });

    await esti.update({
      derniereMaintenance,
      prochaineMaintenance,
      historiqueMaintenance: historique,
      notes: `${esti.notes}\nMaintenance du ${dateMaintenance}: ${description}`
    });

    res.json(esti);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir les équipements ESTI nécessitant une maintenance
exports.getMaintenanceRequise = async (req, res) => {
  try {
    const dateReference = new Date();
    dateReference.setDate(dateReference.getDate() + 30); // Maintenance à effectuer dans les 30 jours

    const estis = await ESTI.findAll({
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

    res.json(estis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir l'historique de maintenance d'un équipement ESTI
exports.getHistoriqueMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const esti = await ESTI.findByPk(id, {
      attributes: ['id', 'reference', 'designation', 'historiqueMaintenance']
    });

    if (!esti) {
      return res.status(404).json({ message: 'Équipement ESTI non trouvé' });
    }

    res.json(esti.historiqueMaintenance || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};