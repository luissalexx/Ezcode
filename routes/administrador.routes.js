const { adminGet, adminUpdate } = require('../controllers/administradorc');
const { Router } = require('express');
const { validarCampos } = require('../middlewares/validar-campos');
const { check } = require('express-validator');
const { AdministradorExiste } = require('../helpers/db-validators');

const router = Router();

router.get('/:id', adminGet);

router.put('/:id', [
    check('id', 'No es un id valido').isMongoId(),
    check('id').custom(AdministradorExiste),
    validarCampos
], adminUpdate);

module.exports = router;