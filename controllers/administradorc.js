const { response, request } = require('express');
const Administrador = require('../models/Administrador')
const { MsgError } = require('../helpers/Myerror');

const adminGet = async (req = request, res = response) => {
    const { id } = req.params;
    try {
        const admin = await Administrador.findById(id);
        res.status(200).json({
            msg: 'Usuario encontrado',
            admin
        })
    } catch (error) {
        console.log(error);
        MsgError(res);
    }
}

const adminUpdate = async (req = request, res = response) => {
    const { id } = req.params;
    const { _id, correo, imagen, ...resto } = req.body;

    try {
        const usuario = await Administrador.findByIdAndUpdate(id, resto);
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const notificacionesGet = async (req = request, res = response) => {
    const { id } = req.params;

    try {
        const admin = await Administrador.findById(id)

        const notificaciones = admin.notificaciones;
        res.status(200).json({ notificaciones });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const notificacionesDelete = async (req = request, res = response) => {
    const { id } = req.params;

    try {
        const admin = await Administrador.findById(id)

        admin.notificaciones = [];
        await admin.save();

        return res.status(200).json({ mensaje: 'Notificaciones limpiadas correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    adminGet,
    adminUpdate,
    notificacionesGet,
    notificacionesDelete
}