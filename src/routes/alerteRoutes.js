const express = require('express');
const router = express.Router();
const alerteController = require('../controllers/alerteController');

// Routes pour la gestion des alertes
router.post('/seuils', alerteController.definirSeuils);
router.get('/verifier', alerteController.verifierAlertes);
router.get('/historique', alerteController.getHistoriqueAlertes);

module.exports = router;