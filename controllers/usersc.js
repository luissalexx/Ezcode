const { response, request } = require('express');
const { validationResult } = require('express-validator');
const { MsgError } = require('../helpers/Myerror');
const Cliente = require('../models/Cliente');

const userPost = async (req = request, res = response) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json(error);
        }

        const { nombre, apellido, sexo, nacimiento, imagen, correo, celular } = req.body;

        const cliente = new Cliente({
            nombre,
            apellido,
            sexo,
            nacimiento,
            imagen,
            correo,
            celular,
        });

        await cliente.save();
        res.status(201).json({
            msg: 'Usuario creado correctamente',
            cliente
        });

    } catch (error) {
        console.log(error);
        MsgError(res);
    }
}

const userGet = async (req = request, res = response) => {
    const { id } = req.params;
    try {
        const alumno = await Cliente.findById(id);
        res.status(200).json({
            msg: 'Usuario encontrado',
            alumno
        })
    } catch (error) {
        console.log(error);
        MsgError(res);
    }
}


const userUpdate = async (req = request, res = response) => {
    const { id } = req.params;
    const { _id, correo, imagen, ...resto } = req.body;

    try {
        const usuario = await Cliente.findByIdAndUpdate(id, resto);
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const userDelete = async (req = request, res = response) => {
    const { id } = req.params;
    const usuario = await Cliente.findByIdAndDelete(id);

    res.json(usuario);
}

const notificacionesGet = async (req = request, res = response) => {
    const { id } = req.params;

    try {
        const cliente = await Cliente.findById(id);

        const notificaciones = cliente.notificaciones;
        res.status(200).json({ notificaciones });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const notificacionesDelete = async (req = request, res = response) => {
    const { id } = req.params;

    try {
        const cliente = await Cliente.findById(id)

        cliente.notificaciones = [];
        await cliente.save();

        return res.status(200).json({ mensaje: 'Notificaciones limpiadas correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    userPost,
    userGet,
    userUpdate,
    userDelete,
    notificacionesGet,
    notificacionesDelete
}