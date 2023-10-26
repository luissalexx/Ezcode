const { Router } = require('express');
const { userPost, userGet, userUpdate, userDelete } = require('../controllers/usersc');
const { validarCampos } = require('../middlewares/validar-campos');
const { check } = require('express-validator');
const { EmailExiste, UsuarioExiste } = require('../helpers/db-validators');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('correo', 'El correo no es valido').isEmail(),
    check('correo').custom(EmailExiste),
    validarCampos
], userPost);

router.get('/', userGet);

router.put('/:id', [
    check('id', 'No es un id valido').isMongoId(),
    check('id').custom(UsuarioExiste),
    validarCampos
], userUpdate);

router.delete('/:id', [
    validarJWT,
    check('id', 'No es un id valido').isMongoId(),
    check('id').custom(UsuarioExiste),
    validarCampos
], userDelete);


module.exports = router;