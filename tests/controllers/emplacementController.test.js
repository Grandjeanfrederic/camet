const request = require('supertest');
const { Emplacement } = require('../../src/models');
const { sequelize, initializeTestDatabase, clearTestDatabase } = require('../setup');
const app = require('../../src/index');

describe('EmplacementController', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await clearTestDatabase();
  });

  beforeEach(async () => {
    await Emplacement.destroy({ where: {} });
  });

  describe('POST /api/emplacements', () => {
    const validEmplacementData = {
      reference: 'EMP001',
      zone: 'ZONE_A',
      type: 'STOCKAGE',
      capacite: 100,
      statut: 'DISPONIBLE',
      localisation: 'Allée 1 - Rack 2'
    };

    it('should create a new emplacement successfully', async () => {
      const response = await request(app)
        .post('/api/emplacements')
        .send(validEmplacementData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.reference).toBe(validEmplacementData.reference);
    });

    it('should validate required fields', async () => {
      const invalidData = { ...validEmplacementData };
      delete invalidData.reference;

      const response = await request(app)
        .post('/api/emplacements')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/emplacements/disponibles', () => {
    beforeEach(async () => {
      await Emplacement.bulkCreate([
        {
          reference: 'EMP001',
          zone: 'ZONE_A',
          type: 'STOCKAGE',
          capacite: 100,
          statut: 'DISPONIBLE',
          localisation: 'Allée 1 - Rack 2'
        },
        {
          reference: 'EMP002',
          zone: 'ZONE_A',
          type: 'STOCKAGE',
          capacite: 100,
          statut: 'OCCUPE',
          localisation: 'Allée 1 - Rack 3'
        }
      ]);
    });

    it('should return only available emplacements', async () => {
      const response = await request(app)
        .get('/api/emplacements/disponibles');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].statut).toBe('DISPONIBLE');
    });

    it('should filter by zone', async () => {
      const response = await request(app)
        .get('/api/emplacements/disponibles?zone=ZONE_A');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].zone).toBe('ZONE_A');
    });
  });

  describe('PUT /api/emplacements/:id/statut', () => {
    let emplacement;

    beforeEach(async () => {
      emplacement = await Emplacement.create({
        reference: 'EMP001',
        zone: 'ZONE_A',
        type: 'STOCKAGE',
        capacite: 100,
        statut: 'DISPONIBLE',
        localisation: 'Allée 1 - Rack 2'
      });
    });

    it('should update emplacement status', async () => {
      const response = await request(app)
        .put(`/api/emplacements/${emplacement.id}/statut`)
        .send({ statut: 'OCCUPE' });

      expect(response.status).toBe(200);
      expect(response.body.statut).toBe('OCCUPE');
    });

    it('should validate status value', async () => {
      const response = await request(app)
        .put(`/api/emplacements/${emplacement.id}/statut`)
        .send({ statut: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});