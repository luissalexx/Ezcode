const { Router } = require("express");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarArchivoSubir } = require("../middlewares/validar-archivo");
const { actualizarImagenCloudinary, mostrarImagen, cargarArchivo } = require("../controllers/upload");
const { check } = require("express-validator");
const { coleccionesPermitidas } = require("../helpers/db-validators");

const router = Router();

router.put('/:coleccion/:id', [
    validarArchivoSubir,
    check('id','El id debe de ser de mongo').isMongoId(),
    check('coleccion').custom( c => coleccionesPermitidas( c, ['administradors','profesors', 'clientes'] ) ),
    validarCampos
], actualizarImagenCloudinary )

router.get('/:coleccion/:id', [
    check('id','El id debe de ser de mongo').isMongoId(),
    check('coleccion').custom( c => coleccionesPermitidas( c, ['administradors','profesors', 'clientes'] ) ),
    validarCampos
], mostrarImagen  )


module.exports = router;