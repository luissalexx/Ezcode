const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { solicitudPost, solicitudesGet, solicitudUpdate, solicitudDelete } = require('../controllers/solicitudAnuncioc');
const { AnuncioExiste, SolicitudAnuncioExiste } = require('../helpers/db-validators');

const router = Router();

router.post('/', [
    validarJWT,
    check('anuncio', 'No es un id de Mongo').isMongoId(),
    check('anuncio').custom(AnuncioExiste),
    validarCampos
], solicitudPost);

router.get('/', validarJWT, solicitudesGet );

router.put('/:id', [
    validarJWT,
    check('id').custom(SolicitudAnuncioExiste),
    validarCampos
], solicitudUpdate);

router.delete('/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(SolicitudAnuncioExiste),
    validarCampos
], solicitudDelete);


module.exports = router;