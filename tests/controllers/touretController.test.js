const request = require('supertest');
const { Touret } = require('../../src/models');
const { sequelize, initializeTestDatabase, clearTestDatabase } = require('../setup');
const app = require('../../src/index');

describe('TouretController', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await clearTestDatabase();
  });

  beforeEach(async () => {
    await Touret.destroy({ where: {} });
  });

  describe('POST /api/tourets', () => {
    const validTouretData = {
      reference: 'TRT001',
      type: 'STANDARD',
      statut: 'DISPONIBLE',
      capacite: 1000,
      poids: 500,
      localisation: 'ZONE_A'
    };

    it('should create a new touret successfully', async () => {
      const response = await request(app)
        .post('/api/tourets')
        .send(validTouretData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.reference).toBe(validTouretData.reference);
    });

    it('should validate required fields', async () => {
      const invalidData = { ...validTouretData };
      delete invalidData.reference;

      const response = await request(app)
        .post('/api/tourets')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tourets/disponibles', () => {
    beforeEach(async () => {
      await Touret.bulkCreate([
        {
          reference: 'TRT001',
          type: 'STANDARD',
          statut: 'DISPONIBLE',
          capacite: 1000,
          poids: 500,
          localisation: 'ZONE_A'
        },
        {
          reference: 'TRT002',
          type: 'STANDARD',
          statut: 'EN_UTILISATION',
          capacite: 1000,
          poids: 500,
          localisation: 'ZONE_B'
        }
      ]);
    });

    it('should return only available tourets', async () => {
      const response = await request(app)
        .get('/api/tourets/disponibles');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].statut).toBe('DISPONIBLE');
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/tourets/disponibles?type=STANDARD');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].type).toBe('STANDARD');
    });
  });

  describe('PUT /api/tourets/:id/statut', () => {
    let touret;

    beforeEach(async () => {
      touret = await Touret.create({
        reference: 'TRT001',
        type: 'STANDARD',
        statut: 'DISPONIBLE',
        capacite: 1000,
        poids: 500,
        localisation: 'ZONE_A'
      });
    });

    it('should update touret status', async () => {
      const response = await request(app)
        .put(`/api/tourets/${touret.id}/statut`)
        .send({ statut: 'EN_UTILISATION' });

      expect(response.status).toBe(200);
      expect(response.body.statut).toBe('EN_UTILISATION');
    });

    it('should validate status value', async () => {
      const response = await request(app)
        .put(`/api/tourets/${touret.id}/statut`)
        .send({ statut: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});