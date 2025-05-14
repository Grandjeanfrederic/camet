const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const { register, login, updateProfile } = require('../controllers/authController');

// Validation des données d'inscription
const registerValidation = [
  body('username').trim().isLength({ min: 3 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
    .withMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'),
  body('nom').trim().notEmpty().escape(),
  body('prenom').trim().notEmpty().escape(),
  body('role').isIn(['admin', 'manager', 'operateur', 'preparateur', 'consultant'])
];

// Validation des données de connexion
const loginValidation = [
  body('username').trim().notEmpty(),
  body('password').notEmpty()
];

// Routes publiques
router.post('/login', loginValidation, login);

// Routes protégées
router.post('/register', auth, checkRole(['admin']), registerValidation, register);
router.put('/profile', auth, updateProfile);

module.exports = router;