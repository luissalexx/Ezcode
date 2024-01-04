const { Router } = require('express');
const { createOrder, captureOrder, cancelOrder, createOrderTema, captureOrderTema } = require('../controllers/paymentc');

const router = Router();

router.post('/create-order/:nombre/:precio', createOrder);

router.get('/capture-order/:idSolicitud/:idCliente', captureOrder);

router.post('/create-order-tema/:nombre/:precio/:idTema', createOrderTema);

router.get('/capture-order-tema/:idTema', captureOrderTema);

router.get('/cancel-order', cancelOrder); 

module.exports = router;