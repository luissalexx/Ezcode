const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { SolicitudCursoExiste, UsuarioExiste, AnuncioExiste } = require('../helpers/db-validators');
const { solicitudPost, solicitudesGet, solicitudUpdate, solicitudGetByAnuncio, solicitudesDelete, solicitudDelete, solicitudesAceptadasGet } = require('../controllers/solicitudCursoc');

const router = Router();

router.post('/', [
    validarJWT,
    check('anuncio', 'No es un id de Mongo').isMongoId(),
    check('anuncio').custom(AnuncioExiste),
    validarCampos
], solicitudPost);

router.get('/', validarJWT, solicitudesGet);

router.get('/aceptada', validarJWT, solicitudesAceptadasGet);

router.get('/:anuncioId', solicitudGetByAnuncio);

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
], solicitudDelete);

router.delete('/all/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(UsuarioExiste),
    validarCampos
], solicitudesDelete);

module.exports = router;
