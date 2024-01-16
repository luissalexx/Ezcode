const { Router } = require('express');
const { userPost, userGet, userUpdate, userDelete, notificacionesGet, notificacionesDelete, reportarUsusario, buscarClientesConReportes, reportesGet, sumarPuntos, reporteDelete, reportesDelete, banearAlumno, desbanearAlumno, restarPuntos } = require('../controllers/usersc');
const { validarCampos } = require('../middlewares/validar-campos');
const { check } = require('express-validator');
const { UsuarioExiste, EmailAdminExiste, EmailExiste, EmailProfeExiste } = require('../helpers/db-validators');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('correo', 'El correo no es valido').isEmail(),
    check('correo', 'El correo ya existe').custom(EmailExiste),
    check('correo', 'El correo ya existe').custom(EmailAdminExiste),
    check('correo', 'El correo ya existe').custom(EmailProfeExiste),
    validarCampos
], userPost);

router.get('/reportes', buscarClientesConReportes);

router.get('/:id', userGet);

router.get('/notificaciones/:id', notificacionesGet);

router.post('/notificaciones/:id', notificacionesDelete);

router.put('/:id', [
    check('id', 'No es un id valido').isMongoId(),
    check('id').custom(UsuarioExiste),
    validarCampos
], userUpdate);

router.delete('/:id', [
    validarJWT,
    check('id', 'No es un id valido').isMongoId(),
    check('id').custom(UsuarioExiste),
    validarCampos
], userDelete);

router.post('/reporte/:userId/:curso', [
    check('tipo', 'El tipo es obligatorio').not().isEmpty(),
    check('motivo', 'El motivo es obligatorio').not().isEmpty(),
    validarCampos
], reportarUsusario);

router.get('/reportesUsuario/:userId', reportesGet);

router.put('/reportePuntos/:userId', [
    check('userId', 'No es un id valido').isMongoId(),
    check('userId').custom(UsuarioExiste),
    check('puntos', 'Los puntos son obligatorios').not().isEmpty(),
    validarCampos
], sumarPuntos);

router.put('/reportePuntosMenos/:userId', [
    check('userId', 'No es un id valido').isMongoId(),
    check('userId').custom(UsuarioExiste),
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
    check('userId').custom(UsuarioExiste),
    validarCampos
], banearAlumno);

router.put('/desbanear/:userId', [
    validarJWT,
    check('userId', 'No es un id valido').isMongoId(),
    check('userId').custom(UsuarioExiste),
    validarCampos
], desbanearAlumno);

module.exports = router;