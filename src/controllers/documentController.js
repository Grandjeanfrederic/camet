const DocumentService = require('../services/documentService');
const { validationResult } = require('express-validator');

class DocumentController {
    async generateDeliveryNote(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { commandeId } = req.params;
            const filePath = await DocumentService.generateDeliveryNote(req.commande);
            
            res.download(filePath);
        } catch (error) {
            console.error('Erreur lors de la génération du bon de livraison:', error);
            res.status(500).json({ message: 'Erreur lors de la génération du document' });
        }
    }

    async generateInventoryReport(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { format } = req.query;
            const { data } = req.body;

            const filePath = await DocumentService.generateInventoryReport(data, format);
            res.download(filePath);
        } catch (error) {
            console.error('Erreur lors de la génération du rapport d\'inventaire:', error);
            res.status(500).json({ message: 'Erreur lors de la génération du rapport' });
        }
    }

    async generateCheckList(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { items } = req.body;
            const filePath = await DocumentService.generateCheckList(items);
            
            res.download(filePath);
        } catch (error) {
            console.error('Erreur lors de la génération de la check-list:', error);
            res.status(500).json({ message: 'Erreur lors de la génération de la check-list' });
        }
    }
}

module.exports = new DocumentController();