const {Router} = require('express');
const { profePost, profeGet, profeUpdate, profeDelete } = require('../controllers/profesorc');
const { validarCampos } = require('../middlewares/validar-campos');
const { ProfesorExiste, EmailProfeExiste, EmailAdminExiste, EmailExiste } = require('../helpers/db-validators');
const { check } = require('express-validator');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('correo', 'El correo no es valido').isEmail(),
    check('correo', 'El correo ya existe').custom(EmailProfeExiste),
    check('correo', 'El correo ya existe').custom(EmailExiste),
    check('correo', 'El correo ya existe').custom(EmailAdminExiste),
    validarCampos
], profePost);

router.get('/profeGet', profeGet);

router.put('/:id', [
    check('id', 'No es un id valido').isMongoId(),
    check('id').custom(ProfesorExiste),
    validarCampos
], profeUpdate);

router.delete('/:id', [
    validarJWT,
    check('id', 'No es un id valido').isMongoId(),
    check('id').custom(ProfesorExiste),
    validarCampos
], profeDelete);



module.exports = router;