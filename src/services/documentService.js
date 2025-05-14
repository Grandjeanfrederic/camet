const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

class DocumentService {
    constructor() {
        this.documentsPath = path.join(__dirname, '..', '..', 'documents');
        if (!fs.existsSync(this.documentsPath)) {
            fs.mkdirSync(this.documentsPath, { recursive: true });
        }
    }

    async generateDeliveryNote(commande) {
        const doc = new PDFDocument();
        const filename = `bon_livraison_${commande.id}_${Date.now()}.pdf`;
        const filePath = path.join(this.documentsPath, filename);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // En-tête
        doc.fontSize(20).text('Bon de Livraison', { align: 'center' });
        doc.moveDown();

        // Informations de la commande
        doc.fontSize(12);
        doc.text(`Numéro de commande: ${commande.id}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.text(`Client: ${commande.Client.nom}`);
        doc.moveDown();

        // Détails des produits
        doc.text('Détails des produits:', { underline: true });
        commande.produits.forEach(produit => {
            doc.text(`- ${produit.nom}: ${produit.quantite} unités`);
        });

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
        });
    }

    async generateInventoryReport(data, format = 'excel') {
        if (format === 'excel') {
            return this.generateExcelReport(data);
        } else if (format === 'pdf') {
            return this.generatePDFReport(data);
        }
        throw new Error('Format non supporté');
    }

    async generateExcelReport(data) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inventaire');

        // En-têtes
        worksheet.columns = [
            { header: 'ID', key: 'id' },
            { header: 'Produit', key: 'produit' },
            { header: 'Quantité', key: 'quantite' },
            { header: 'Emplacement', key: 'emplacement' },
            { header: 'Dernière mise à jour', key: 'date' }
        ];

        // Données
        worksheet.addRows(data);

        const filename = `inventaire_${Date.now()}.xlsx`;
        const filePath = path.join(this.documentsPath, filename);

        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }

    async generatePDFReport(data) {
        const doc = new PDFDocument();
        const filename = `rapport_${Date.now()}.pdf`;
        const filePath = path.join(this.documentsPath, filename);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Titre
        doc.fontSize(20).text('Rapport d\'inventaire', { align: 'center' });
        doc.moveDown();

        // Tableau des données
        doc.fontSize(12);
        data.forEach((item, index) => {
            const text = `${item.id} | ${item.produit} | ${item.quantite} | ${item.emplacement} | ${item.date}`;
            doc.text(text, { align: 'left' });
            if (index < data.length - 1) doc.moveDown(0.5);
        });

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
        });
    }

    async generateCheckList(items) {
        const doc = new PDFDocument();
        const filename = `checklist_${Date.now()}.pdf`;
        const filePath = path.join(this.documentsPath, filename);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Titre
        doc.fontSize(20).text('Check-list de vérification', { align: 'center' });
        doc.moveDown();

        // Liste des éléments à vérifier
        doc.fontSize(12);
        items.forEach((item, index) => {
            doc.text(`□ ${item.description}`);
            if (index < items.length - 1) doc.moveDown(0.5);
        });

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
        });
    }
}

module.exports = new DocumentService();