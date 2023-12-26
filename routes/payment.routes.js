const {Router} = require('express');
const { createOrder, captureOrder, cancelOrder } = require('../controllers/paymentc');

const router = Router();

router.post('/create-order/:nombre/:precio', createOrder);

router.get('/capture-order/:idSolicitud/:idCliente', captureOrder);

router.get('/cancel-order', cancelOrder);

module.exports = router;