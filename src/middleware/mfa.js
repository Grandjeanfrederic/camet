const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { User } = require('../models');
const securityConfig = require('../config/security');

// Génération du secret MFA
const generateMFASecret = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `${securityConfig.mfa.issuer}:${req.user.email}`,
      issuer: securityConfig.mfa.issuer
    });

    // Mise à jour du secret MFA de l'utilisateur
    await User.update(
      { secretMFA: secret.base32 },
      { where: { id: req.user.id } }
    );

    // Génération du QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la génération du secret MFA' });
  }
};

// Vérification du code MFA
const verifyMFAToken = (req, res, next) => {
  try {
    const { token } = req.body;
    const { secretMFA } = req.user;

    if (!secretMFA) {
      return res.status(400).json({ error: 'MFA non configuré' });
    }

    const verified = speakeasy.totp.verify({
      secret: secretMFA,
      encoding: 'base32',
      token,
      window: 1,
      digits: securityConfig.mfa.digits,
      step: securityConfig.mfa.step
    });

    if (!verified) {
      return res.status(401).json({ error: 'Code MFA invalide' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la vérification du code MFA' });
  }
};

// Middleware pour vérifier si MFA est requis
const requireMFA = (req, res, next) => {
  if (!securityConfig.mfa.enabled) {
    return next();
  }

  if (!req.user.facteurAuthentification) {
    return next();
  }

  // Si MFA est activé pour l'utilisateur, on vérifie le token
  verifyMFAToken(req, res, next);
};

module.exports = {
  generateMFASecret,
  verifyMFAToken,
  requireMFA
};