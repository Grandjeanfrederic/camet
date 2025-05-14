const { EISE } = require('../models');
const { Op } = require('sequelize');

// Créer un nouvel équipement EISE
exports.create = async (req, res) => {
  try {
    const data = req.body;
    
    // Génération des codes uniques
    data.codeBarres = `EISE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    data.qrCode = `QR-EISE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Initialisation de l'historique
    data.historiqueModifications = [{
      date: new Date(),
      type: 'creation',
      details: 'Création initiale de l\'équipement',
      utilisateur: req.user?.id || 'system'
    }];

    const eise = await EISE.create(data);
    res.status(201).json(eise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupérer tous les équipements EISE avec filtres optionnels
exports.findAll = async (req, res) => {
  try {
    const { reference, designation, etat, type } = req.query;
    const where = {};

    if (reference) where.reference = { [Op.like]: `%${reference}%` };
    if (designation) where.designation = { [Op.like]: `%${designation}%` };
    if (etat) where.etat = etat;
    if (type) where.type = type;

    const eises = await EISE.findAll({
      where,
      include: ['Client', 'Emplacement'],
      order: [['dateExpiration', 'ASC']]
    });

    res.json(eises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un équipement EISE par son ID
exports.findOne = async (req, res) => {
  try {
    const eise = await EISE.findByPk(req.params.id, {
      include: ['Client', 'Emplacement', 'Commandes']
    });

    if (!eise) {
      return res.status(404).json({ message: 'Équipement EISE non trouvé' });
    }

    res.json(eise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un équipement EISE
exports.update = async (req, res) => {
  try {
    const eise = await EISE.findByPk(req.params.id);

    if (!eise) {
      return res.status(404).json({ message: 'Équipement EISE non trouvé' });
    }

    // Enregistrement des modifications dans l'historique
    const modifications = eise.historiqueModifications || [];
    modifications.push({
      date: new Date(),
      type: 'modification',
      details: 'Mise à jour des informations de l\'équipement',
      modifications: Object.keys(req.body).map(key => ({
        champ: key,
        ancienneValeur: eise[key],
        nouvelleValeur: req.body[key]
      })),
      utilisateur: req.user?.id || 'system'
    });

    req.body.historiqueModifications = modifications;

    await eise.update(req.body);
    res.json(eise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un équipement EISE
exports.delete = async (req, res) => {
  try {
    const eise = await EISE.findByPk(req.params.id);

    if (!eise) {
      return res.status(404).json({ message: 'Équipement EISE non trouvé' });
    }

    await eise.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rechercher des équipements EISE par critères avancés
exports.search = async (req, res) => {
  try {
    const { query, dateExpirationDebut, dateExpirationFin, client } = req.query;
    const where = {};

    if (query) {
      where[Op.or] = [
        { reference: { [Op.like]: `%${query}%` } },
        { designation: { [Op.like]: `%${query}%` } },
        { type: { [Op.like]: `%${query}%` } }
      ];
    }

    if (dateExpirationDebut && dateExpirationFin) {
      where.dateExpiration = {
        [Op.between]: [new Date(dateExpirationDebut), new Date(dateExpirationFin)]
      };
    }

    if (client) where.ClientId = client;

    const eises = await EISE.findAll({
      where,
      include: ['Client', 'Emplacement'],
      order: [['dateExpiration', 'ASC']]
    });

    res.json(eises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour le contrôle périodique d'un équipement EISE
exports.updateControle = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateControle, resultat, notes } = req.body;

    const eise = await EISE.findByPk(id);
    if (!eise) {
      return res.status(404).json({ message: 'Équipement EISE non trouvé' });
    }

    // Mise à jour des dates de contrôle
    const dernierControle = new Date(dateControle);
    const prochainControle = new Date(dateControle);
    prochainControle.setDate(prochainControle.getDate() + eise.frequenceControle);

    await eise.update({
      dernierControle,
      prochainControle,
      notes: notes ? `${eise.notes}\nContrôle du ${dateControle}: ${resultat}\n${notes}` : eise.notes
    });

    res.json(eise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir les équipements EISE à contrôler
exports.getControlesAEffectuer = async (req, res) => {
  try {
    const dateReference = new Date();
    dateReference.setDate(dateReference.getDate() + 30); // Contrôles à effectuer dans les 30 jours

    const eises = await EISE.findAll({
      where: {
        prochainControle: {
          [Op.lte]: dateReference
        },
        etat: {
          [Op.not]: ['perime', 'hors_service']
        }
      },
      include: ['Client', 'Emplacement'],
      order: [['prochainControle', 'ASC']]
    });

    res.json(eises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les équipements EISE expirés ou proche de l'expiration
exports.getExpirationProche = async (req, res) => {
  try {
    const dateReference = new Date();
    dateReference.setDate(dateReference.getDate() + 90); // Expiration dans les 90 jours

    const eises = await EISE.findAll({
      where: {
        dateExpiration: {
          [Op.lte]: dateReference
        },
        etat: {
          [Op.not]: ['perime', 'hors_service']
        }
      },
      include: ['Client', 'Emplacement'],
      order: [['dateExpiration', 'ASC']]
    });

    res.json(eises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};