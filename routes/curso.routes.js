const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { CursoExiste, UsuarioExiste } = require('../helpers/db-validators');
const { cursoGet, cursoUpdateStatus, cursoUpdate, cursoDelete, temaPost, temasGet, temaPut, temaDelete, temaGetById, tareasPost, tareasPendientesGet, tareasEntregadasGet, entregarTarea, tareaPut, tareaDelete, tareaGetById, calificarTarea, cursosDelete } = require('../controllers/cursoc');

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
    check('calificacion', 'La calificacion es obligatoria').not().isEmpty(),
    validarCampos
], cursoUpdateStatus);

router.delete('/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(CursoExiste),
    validarCampos
], cursoDelete);

router.delete('/all/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(UsuarioExiste),
    validarCampos
], cursosDelete);

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

router.post('/tarea/:id', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('asignacion', 'La asignacion es obligatoria').not().isEmpty(),
], tareasPost);

router.get('/tarea/:id/:idTarea', tareaGetById);

router.get('/pendientes/:id', tareasPendientesGet);

router.get('/entregadas/:id', tareasEntregadasGet);

router.put('/asignacion/:id/:tareaId', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('asignacion', 'La asignacion es obligatoria').not().isEmpty(),
], tareaPut);

router.put('/tarea/:id/:tareaId', [
    validarJWT,
    check('archivoId', 'El archivoId es obligatorio').not().isEmpty(),
    check('url', 'El url es obligatorio').not().isEmpty(),
], entregarTarea);

router.put('/tareaCalificar/:cursoId/:tareaId', [
    validarJWT,
    check('calificacion', 'La calificacion es obligatoria').not().isEmpty(),
], calificarTarea);

router.delete('/tarea/:id/:tareaId', [
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(CursoExiste),
    validarCampos
], tareaDelete);

module.exports = router;