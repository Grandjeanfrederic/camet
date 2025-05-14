const { AlerteHistorique } = require('../../src/models');
const alerteService = require('../../src/services/alerteService');
const { sequelize, initializeTestDatabase, clearTestDatabase } = require('../setup');

describe('AlerteService', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await clearTestDatabase();
  });

  beforeEach(async () => {
    await AlerteHistorique.destroy({ where: {} });
  });

  describe('createAlerte', () => {
    const alerteData = {
      type: 'RETARD_LIVRAISON',
      message: 'Retard de livraison détecté',
      severite: 'HAUTE',
      statut: 'ACTIVE',
      entiteId: 1,
      entiteType: 'COMMANDE'
    };

    it('should create a new alerte successfully', async () => {
      const alerte = await alerteService.createAlerte(alerteData);

      expect(alerte).toBeTruthy();
      expect(alerte.type).toBe(alerteData.type);
      expect(alerte.message).toBe(alerteData.message);
      expect(alerte.severite).toBe(alerteData.severite);
      expect(alerte.statut).toBe(alerteData.statut);
    });

    it('should validate required fields', async () => {
      const invalidData = { ...alerteData };
      delete invalidData.type;

      await expect(alerteService.createAlerte(invalidData))
        .rejects
        .toThrow('Le type d\'alerte est requis');
    });
  });

  describe('updateAlerteStatus', () => {
    let alerte;

    beforeEach(async () => {
      alerte = await AlerteHistorique.create({
        type: 'RETARD_LIVRAISON',
        message: 'Retard de livraison détecté',
        severite: 'HAUTE',
        statut: 'ACTIVE',
        entiteId: 1,
        entiteType: 'COMMANDE'
      });
    });

    it('should update alerte status successfully', async () => {
      const updatedAlerte = await alerteService.updateAlerteStatus(
        alerte.id,
        'RESOLUE'
      );

      expect(updatedAlerte.statut).toBe('RESOLUE');
    });

    it('should throw error for invalid status', async () => {
      await expect(alerteService.updateAlerteStatus(alerte.id, 'INVALID_STATUS'))
        .rejects
        .toThrow('Statut d\'alerte invalide');
    });

    it('should throw error for non-existent alerte', async () => {
      await expect(alerteService.updateAlerteStatus(999999, 'RESOLUE'))
        .rejects
        .toThrow('Alerte non trouvée');
    });
  });

  describe('getAlertesByEntity', () => {
    beforeEach(async () => {
      await AlerteHistorique.bulkCreate([
        {
          type: 'RETARD_LIVRAISON',
          message: 'Retard de livraison détecté',
          severite: 'HAUTE',
          statut: 'ACTIVE',
          entiteId: 1,
          entiteType: 'COMMANDE'
        },
        {
          type: 'STOCK_BAS',
          message: 'Niveau de stock critique',
          severite: 'MOYENNE',
          statut: 'ACTIVE',
          entiteId: 1,
          entiteType: 'COMMANDE'
        }
      ]);
    });

    it('should return all alerts for an entity', async () => {
      const alertes = await alerteService.getAlertesByEntity('COMMANDE', 1);

      expect(alertes).toHaveLength(2);
      expect(alertes[0].entiteType).toBe('COMMANDE');
      expect(alertes[0].entiteId).toBe(1);
    });

    it('should return empty array for entity with no alerts', async () => {
      const alertes = await alerteService.getAlertesByEntity('COMMANDE', 999);

      expect(alertes).toHaveLength(0);
    });
  });
});