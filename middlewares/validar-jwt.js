const { request, response } = require('express');
const jwt = require('jsonwebtoken');
const Cliente = require('../models/Cliente');
const Profesor = require('../models/Profesor');
const Administrador = require('../models/Administrador');

const validarJWT = async (req = request, res = response, next) => {
    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }

    try {

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        var tipo = "";

        let usuario = await Cliente.findById(uid);

        if (usuario) {
            tipo = 'Cliente'
        } else {
            usuario = await Profesor.findById(uid);
            if (usuario) {
                tipo = 'Profesor'
            }
            else {
                usuario = await Administrador.findById(uid);
                if (usuario) {
                    tipo = 'Administrador'
                }
            }
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe'
            })
        }

        req.uid = uid;
        req.usuario = usuario;
        req.tipo = tipo;

    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        });
    }
    next();
}


module.exports = {
    validarJWT
}