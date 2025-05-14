const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { Op } = require('sequelize');
const winston = require('winston');

// Configuration du logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/security.log' })
  ]
});

// Génération du token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Inscription d'un nouvel utilisateur
const register = async (req, res) => {
  try {
    const { username, email, password, nom, prenom, role, clientId } = req.body;

    // Vérification des permissions pour la création d'utilisateurs
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }

    const user = await User.create({
      username,
      email,
      password,
      nom,
      prenom,
      role,
      clientId
    });

    logger.info('Nouvel utilisateur créé', {
      userId: user.id,
      username: user.username,
      role: user.role
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la création d\'utilisateur', { error: error.message });
    res.status(400).json({ error: error.message });
  }
};

// Connexion utilisateur
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.unscoped().findOne({ where: { username } });

    if (!user || !user.actif) {
      throw new Error('Identifiants invalides');
    }

    if (user.dateVerrouillage && new Date() < new Date(user.dateVerrouillage)) {
      throw new Error('Compte temporairement verrouillé');
    }

    const isValidPassword = await user.verifyPassword(password);

    if (!isValidPassword) {
      user.tentativesConnexion += 1;
      if (user.tentativesConnexion >= 5) {
        user.dateVerrouillage = new Date(Date.now() + 30 * 60000); // 30 minutes
        logger.warn('Compte verrouillé après 5 tentatives échouées', {
          userId: user.id,
          username: user.username
        });
      }
      await user.save();
      throw new Error('Identifiants invalides');
    }

    // Réinitialisation des tentatives de connexion
    user.tentativesConnexion = 0;
    user.dernierLogin = new Date();
    await user.save();

    const token = generateToken(user);

    logger.info('Connexion réussie', {
      userId: user.id,
      username: user.username
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    logger.error('Erreur de connexion', {
      username: req.body.username,
      error: error.message
    });
    res.status(401).json({ error: error.message });
  }
};

// Mise à jour du profil utilisateur
const updateProfile = async (req, res) => {
  try {
    const { password, email, telephone } = req.body;
    const user = await User.findByPk(req.user.id);

    if (password) {
      user.password = password;
    }
    if (email) {
      user.email = email;
    }
    if (telephone) {
      user.telephone = telephone;
    }

    await user.save();

    logger.info('Profil utilisateur mis à jour', {
      userId: user.id,
      username: user.username
    });

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du profil', {
      userId: req.user.id,
      error: error.message
    });
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  updateProfile
};