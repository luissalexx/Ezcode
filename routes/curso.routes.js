const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { CursoExiste } = require('../helpers/db-validators');
const { cursoGet, cursoUpdateStatus, cursoUpdate, cursoDelete, temaPost, temasGet, temaPut, temaDelete, temaGetById } = require('../controllers/cursoc');

const router = Router();

router.get('/:id', cursoGet);

router.put('/details/:id', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('categoria', 'La categoria es obligatoria').not().isEmpty(),
    check('descripcion', 'La descripcion es obligatoria').not().isEmpty(),
    check('id').custom(CursoExiste),
    validarCampos
], cursoUpdate);

router.put('/:id', [
    validarJWT,
], cursoUpdateStatus);

router.delete('/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(CursoExiste),
    validarCampos
], cursoDelete);

router.post('/tema/:id', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
], temaPost);

router.get('/temas/:id', temasGet);

router.get('/tema/:id/:idTema', temaGetById);

router.put('/tema/:id/:idTema', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
], temaPut);

router.delete('/tema/:id/:temaId', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(CursoExiste),
    validarCampos
], temaDelete);


module.exports = router;