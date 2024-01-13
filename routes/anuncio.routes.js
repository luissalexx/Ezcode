const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { anuncioPost, anuncioGetById, anuncioUpdate, anuncioDelete, anuncioUpdateStatus, anunciosGet, anunciosDelete, resenaPost, resenasGet, popularesGet } = require('../controllers/anuncioc');
const { AnuncioExiste, ProfesorExiste } = require('../helpers/db-validators');

const router = Router();

router.post('/', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('categoria', 'La categoria es obligatoria').not().isEmpty(),
    check('descripcion', 'La descripcion es obligatoria').not().isEmpty(),
    validarCampos
], anuncioPost);

router.get('/published/', anunciosGet);

router.get('/populars/', popularesGet);

router.get('/:id', [
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(AnuncioExiste),
    validarCampos
], anuncioGetById);

router.put('/details/:id', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('categoria', 'La categoria es obligatoria').not().isEmpty(),
    check('descripcion', 'La descripcion es obligatoria').not().isEmpty(),
    check('id').custom(AnuncioExiste),
    validarCampos
], anuncioUpdate);

router.put('/:id', [
    validarJWT,
], anuncioUpdateStatus);

router.delete('/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(AnuncioExiste),
    validarCampos
], anuncioDelete);
 
router.delete('/all/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(ProfesorExiste),
    validarCampos
], anunciosDelete);

router.post('/resenas/:anuncioId/:alumnoId', [
    check('estrellas', 'Las estrellas son obligatorias').not().isEmpty(),
    validarCampos
], resenaPost);

router.get('/resenas/:anuncioId', resenasGet);

module.exports = router;