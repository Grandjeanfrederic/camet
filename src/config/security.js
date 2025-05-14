const path = require('path');

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'votre-secret-jwt-securise',
    expiresIn: '24h'
  },
  password: {
    minLength: 8,
    maxAttempts: 5,
    lockDuration: 30 * 60 * 1000, // 30 minutes en millisecondes
    pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/
  },
  logging: {
    security: {
      filename: path.join(__dirname, '../../logs/security.log'),
      level: 'info'
    }
  },
  roles: {
    admin: ['all'],
    manager: ['read', 'write', 'update'],
    operateur: ['read', 'write'],
    preparateur: ['read', 'write'],
    consultant: ['read']
  },
  mfa: {
    enabled: true,
    issuer: 'CAMET App',
    digits: 6,
    step: 30 // Durée de validité du code en secondes
  }
};