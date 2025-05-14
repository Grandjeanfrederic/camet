const { Document } = require('../../src/models');
const documentService = require('../../src/services/documentService');
const { sequelize, initializeTestDatabase, clearTestDatabase } = require('../setup');

describe('DocumentService', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await clearTestDatabase();
  });

  beforeEach(async () => {
    await Document.destroy({ where: {} });
  });

  describe('generatePDF', () => {
    const documentData = {
      type: 'FACTURE',
      reference: 'FAC001',
      contenu: {
        client: {
          nom: 'Client Test',
          adresse: '123 Rue Test'
        },
        produits: [
          { nom: 'Produit 1', quantite: 2, prix: 100 },
          { nom: 'Produit 2', quantite: 1, prix: 50 }
        ]
      }
    };

    it('should generate PDF document successfully', async () => {
      const pdfBuffer = await documentService.generatePDF(documentData);

      expect(pdfBuffer).toBeTruthy();
      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it('should throw error for invalid document type', async () => {
      const invalidData = { ...documentData, type: 'INVALID_TYPE' };

      await expect(documentService.generatePDF(invalidData))
        .rejects
        .toThrow('Type de document invalide');
    });
  });

  describe('generateExcel', () => {
    const reportData = {
      type: 'RAPPORT_STOCK',
      periode: 'MENSUEL',
      donnees: [
        { produit: 'Produit 1', quantite: 100, valeur: 5000 },
        { produit: 'Produit 2', quantite: 50, valeur: 2500 }
      ]
    };

    it('should generate Excel report successfully', async () => {
      const excelBuffer = await documentService.generateExcel(reportData);

      expect(excelBuffer).toBeTruthy();
      expect(Buffer.isBuffer(excelBuffer)).toBe(true);
      expect(excelBuffer.length).toBeGreaterThan(0);
    });

    it('should throw error for invalid report type', async () => {
      const invalidData = { ...reportData, type: 'INVALID_TYPE' };

      await expect(documentService.generateExcel(invalidData))
        .rejects
        .toThrow('Type de rapport invalide');
    });
  });

  describe('storeDocument', () => {
    const documentInfo = {
      type: 'FACTURE',
      reference: 'FAC001',
      format: 'PDF',
      taille: 1024,
      url: '/documents/FAC001.pdf'
    };

    it('should store document metadata successfully', async () => {
      const document = await documentService.storeDocument(documentInfo);

      expect(document).toBeTruthy();
      expect(document.type).toBe(documentInfo.type);
      expect(document.reference).toBe(documentInfo.reference);
      expect(document.url).toBe(documentInfo.url);
    });

    it('should validate required fields', async () => {
      const invalidInfo = { ...documentInfo };
      delete invalidInfo.reference;

      await expect(documentService.storeDocument(invalidInfo))
        .rejects
        .toThrow('La référence du document est requise');
    });
  });
});