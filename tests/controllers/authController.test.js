const request = require('supertest');
const bcrypt = require('bcryptjs');
const { User } = require('../../src/models');
const { sequelize, initializeTestDatabase, clearTestDatabase } = require('../setup');
const app = require('../../src/index');

describe('AuthController', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await clearTestDatabase();
  });

  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  describe('POST /api/auth/register', () => {
    const validUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'user'
    };

    it('should create a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Utilisateur créé avec succès');
      
      const user = await User.findOne({ where: { email: validUserData.email } });
      expect(user).toBeTruthy();
      expect(user.username).toBe(validUserData.username);
    });

    it('should not create user with existing email', async () => {
      await User.create(validUserData);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user'
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/mfa/setup', () => {
    let authToken;

    beforeEach(async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('Password123!', 10),
        role: 'user'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      authToken = loginResponse.body.token;
    });

    it('should setup MFA successfully', async () => {
      const response = await request(app)
        .post('/api/auth/mfa/setup')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('secret');
      expect(response.body).toHaveProperty('qrCode');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/auth/mfa/setup');

      expect(response.status).toBe(401);
    });
  });
});