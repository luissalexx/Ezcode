const { Router } = require('express');
const { check } = require('express-validator');
const { googleSignIn, revalidarToken } = require('../controllers/auth');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

router.post('/google', [
    check('id_token', 'El token es obligatorio').not().isEmpty(),
    validarCampos
], googleSignIn);

router.get('/renew', validarJWT, revalidarToken);

module.exports = router;