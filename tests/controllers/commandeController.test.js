const request = require('supertest');
const { Commande } = require('../../src/models');
const { sequelize, initializeTestDatabase, clearTestDatabase } = require('../setup');
const app = require('../../src/index');

describe('CommandeController', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await clearTestDatabase();
  });

  beforeEach(async () => {
    await Commande.destroy({ where: {} });
  });

  describe('POST /api/commandes', () => {
    const validCommandeData = {
      reference: 'CMD001',
      clientId: 1,
      statut: 'EN_COURS',
      dateCommande: new Date(),
      dateLivraisonPrevue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      produits: [
        { id: 1, quantite: 2 },
        { id: 2, quantite: 1 }
      ]
    };

    it('should create a new commande successfully', async () => {
      const response = await request(app)
        .post('/api/commandes')
        .send(validCommandeData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.reference).toBe(validCommandeData.reference);
    });

    it('should validate required fields', async () => {
      const invalidData = { ...validCommandeData };
      delete invalidData.reference;

      const response = await request(app)
        .post('/api/commandes')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/commandes/:id', () => {
    let commande;

    beforeEach(async () => {
      commande = await Commande.create({
        reference: 'CMD001',
        clientId: 1,
        statut: 'EN_COURS',
        dateCommande: new Date(),
        dateLivraisonPrevue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    });

    it('should return commande details', async () => {
      const response = await request(app)
        .get(`/api/commandes/${commande.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(commande.id);
      expect(response.body.reference).toBe(commande.reference);
    });

    it('should return 404 for non-existent commande', async () => {
      const response = await request(app)
        .get('/api/commandes/999999');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/commandes/:id/statut', () => {
    let commande;

    beforeEach(async () => {
      commande = await Commande.create({
        reference: 'CMD001',
        clientId: 1,
        statut: 'EN_COURS',
        dateCommande: new Date(),
        dateLivraisonPrevue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    });

    it('should update commande status', async () => {
      const response = await request(app)
        .put(`/api/commandes/${commande.id}/statut`)
        .send({ statut: 'LIVREE' });

      expect(response.status).toBe(200);
      expect(response.body.statut).toBe('LIVREE');
    });

    it('should validate status value', async () => {
      const response = await request(app)
        .put(`/api/commandes/${commande.id}/statut`)
        .send({ statut: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});