const { Router } = require('express');
const { profePost, profeGet, profeUpdate, profeDelete, notificacionesGet, notificacionesDelete, reportarProfesor, buscarProfesoresConReportes, reportesGet, sumarPuntos, reporteDelete, reportesDelete, banearProfesor, desbanearProfesor, restarPuntos } = require('../controllers/profesorc');
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

router.get('/reportes', buscarProfesoresConReportes);

router.get('/:id', profeGet);

router.get('/notificaciones/:id', notificacionesGet);

router.post('/notificaciones/:id', notificacionesDelete);

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

router.post('/reporte/:userId/:curso', [
    check('tipo', 'El tipo es obligatorio').not().isEmpty(),
    check('motivo', 'El motivo es obligatorio').not().isEmpty(),
    validarCampos
], reportarProfesor);

router.get('/reportesProfesor/:userId', reportesGet);

router.put('/reportePuntos/:userId', [
    check('userId', 'No es un id valido').isMongoId(),
    check('userId').custom(ProfesorExiste),
    check('puntos', 'Los puntos son obligatorios').not().isEmpty(),
    validarCampos
], sumarPuntos);

router.put('/reportePuntosMenos/:userId', [
    check('userId', 'No es un id valido').isMongoId(),
    check('userId').custom(ProfesorExiste),
    check('puntos', 'Los puntos son obligatorios').not().isEmpty(),
    validarCampos
], restarPuntos);

router.delete('/reporte/:userId/:reporteId', [
    validarJWT,
], reporteDelete);

router.delete('/reportes/:userId', reportesDelete);

router.put('/banear/:userId', [
    validarJWT,
    check('userId', 'No es un id valido').isMongoId(),
    check('userId').custom(ProfesorExiste),
    validarCampos
], banearProfesor);

router.put('/desbanear/:userId', [
    validarJWT,
    check('userId', 'No es un id valido').isMongoId(),
    check('userId').custom(ProfesorExiste),
    validarCampos
], desbanearProfesor);

module.exports = router;