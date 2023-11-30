const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { CursoExiste, SolicitudCursoExiste } = require('../helpers/db-validators');
const { solicitudPost, solicitudesGet, solicitudUpdate } = require('../controllers/solicitudCursoc');

const router = Router();

router.post('/', [
    validarJWT,
    check('curso', 'No es un id de Mongo').isMongoId(),
    check('curso').custom(CursoExiste),
    validarCampos
], solicitudPost);

router.get('/', validarJWT, solicitudesGet);

router.put('/:id', [
    validarJWT,
    check('id').custom(SolicitudCursoExiste),
    validarCampos
], solicitudUpdate);

router.delete('/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(SolicitudCursoExiste),
    validarCampos
], );


module.exports = router;