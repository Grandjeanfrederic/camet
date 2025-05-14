const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const DocumentController = require('../controllers/documentController');
const auth = require('../middleware/auth');

// Middleware pour vérifier l'existence de la commande
const checkCommande = async (req, res, next) => {
    try {
        const { commandeId } = req.params;
        const commande = await Commande.findByPk(commandeId, {
            include: [{ model: Client }]
        });
        if (!commande) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }
        req.commande = commande;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la vérification de la commande' });
    }
};

// Générer un bon de livraison
router.get('/delivery-note/:commandeId',
    auth(['admin', 'manager', 'preparateur']),
    checkCommande,
    DocumentController.generateDeliveryNote
);

// Générer un rapport d'inventaire
router.post('/inventory-report',
    auth(['admin', 'manager']),
    [
        query('format').optional().isIn(['excel', 'pdf']).withMessage('Format non valide'),
        body('data').isArray().withMessage('Les données doivent être un tableau')
    ],
    DocumentController.generateInventoryReport
);

// Générer une check-list
router.post('/checklist',
    auth(['admin', 'manager', 'preparateur']),
    [
        body('items').isArray().withMessage('Les éléments doivent être un tableau'),
        body('items.*.description').isString().notEmpty().withMessage('Description requise pour chaque élément')
    ],
    DocumentController.generateCheckList
);

module.exports = router;