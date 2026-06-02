const express = require('express');
const router = express.Router();
const wompiController = require('../controllers/wompi.controller');

// Rutas para Wompi
router.post('/crear-transaccion', wompiController.crearTransaccion);
router.post('/webhook', wompiController.webhookConfirmacion);
router.get('/transaccion/:transactionId', wompiController.verificarTransaccion);

module.exports = router;