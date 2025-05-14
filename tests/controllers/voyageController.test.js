const request = require('supertest');
const { Voyage } = require('../../src/models');
const { sequelize, initializeTestDatabase, clearTestDatabase } = require('../setup');
const app = require('../../src/index');

describe('VoyageController', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await clearTestDatabase();
  });

  beforeEach(async () => {
    await Voyage.destroy({ where: {} });
  });

  describe('POST /api/voyages', () => {
    const validVoyageData = {
      reference: 'VOY001',
      type: 'LIVRAISON',
      statut: 'PLANIFIE',
      dateDepart: new Date(),
      dateArriveeEstimee: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      origine: 'DEPOT_A',
      destination: 'CLIENT_B',
      vehiculeId: 1
    };

    it('should create a new voyage successfully', async () => {
      const response = await request(app)
        .post('/api/voyages')
        .send(validVoyageData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.reference).toBe(validVoyageData.reference);
    });

    it('should validate required fields', async () => {
      const invalidData = { ...validVoyageData };
      delete invalidData.reference;

      const response = await request(app)
        .post('/api/voyages')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/voyages/planifies', () => {
    beforeEach(async () => {
      await Voyage.bulkCreate([
        {
          reference: 'VOY001',
          type: 'LIVRAISON',
          statut: 'PLANIFIE',
          dateDepart: new Date(),
          dateArriveeEstimee: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          origine: 'DEPOT_A',
          destination: 'CLIENT_B',
          vehiculeId: 1
        },
        {
          reference: 'VOY002',
          type: 'LIVRAISON',
          statut: 'EN_COURS',
          dateDepart: new Date(),
          dateArriveeEstimee: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          origine: 'DEPOT_A',
          destination: 'CLIENT_C',
          vehiculeId: 2
        }
      ]);
    });

    it('should return only planned voyages', async () => {
      const response = await request(app)
        .get('/api/voyages/planifies');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].statut).toBe('PLANIFIE');
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/voyages/planifies?type=LIVRAISON');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].type).toBe('LIVRAISON');
    });
  });

  describe('PUT /api/voyages/:id/statut', () => {
    let voyage;

    beforeEach(async () => {
      voyage = await Voyage.create({
        reference: 'VOY001',
        type: 'LIVRAISON',
        statut: 'PLANIFIE',
        dateDepart: new Date(),
        dateArriveeEstimee: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        origine: 'DEPOT_A',
        destination: 'CLIENT_B',
        vehiculeId: 1
      });
    });

    it('should update voyage status', async () => {
      const response = await request(app)
        .put(`/api/voyages/${voyage.id}/statut`)
        .send({ statut: 'EN_COURS' });

      expect(response.status).toBe(200);
      expect(response.body.statut).toBe('EN_COURS');
    });

    it('should validate status value', async () => {
      const response = await request(app)
        .put(`/api/voyages/${voyage.id}/statut`)
        .send({ statut: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});