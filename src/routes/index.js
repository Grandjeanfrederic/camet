const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const alerteRoutes = require('./alerteRoutes');
const documentRoutes = require('./documentRoutes');

router.use('/auth', authRoutes);
router.use('/alerte', alerteRoutes);
router.use('/documents', documentRoutes);

module.exports = router;