const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { UsuarioExiste, CursoExiste } = require('../helpers/db-validators');
const { cursoGet, cursoUpdateStatus, cursoUpdate, cursoDelete, cursoPost } = require('../controllers/cursoc');

const router = Router();

router.post('/', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('categoria', 'La categoria es obligatoria').not().isEmpty(),
    check('descripcion', 'La descripcion es obligatoria').not().isEmpty(),
    check('alumno', 'No es un id de Mongo').isMongoId(),
    check('alumno').custom(UsuarioExiste),
    validarCampos
], cursoPost);

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


module.exports = router;