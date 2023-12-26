const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { CursoExiste} = require('../helpers/db-validators');
const { cursoGet, cursoUpdateStatus, cursoUpdate, cursoDelete, temaPost, temasGet, temaPut, temaDelete } = require('../controllers/cursoc');

const router = Router();

router.get('/:id', cursoGet);

router.put('/details/:id', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('categoria', 'La categoria es obligatoria').not().isEmpty(),
    check('descripcion', 'La descripcion es obligatoria').not().isEmpty(),
    check('precio', 'El precio es obligatorio').not().isEmpty(),
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
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('contenido', 'El contenido es obligatorio').not().isEmpty(),
    validarCampos
], temaPost);

router.get('/tema/:id', temasGet);

router.put('/tema/:idCurso/:idTema', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('contenido', 'El contenido es obligatorio').not().isEmpty(),
    validarCampos
], temaPut);

router.delete('/tema/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(CursoExiste),
    validarCampos
], temaDelete);


module.exports = router;