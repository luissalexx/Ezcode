const { response, request } = require('express');
const { MsgError } = require('../helpers/Myerror');
const Profesor = require('../models/Profesor');

const profePost = async (req = request, res = response) => {
    try {
        const { nombre, apellido, sexo, nacimiento, imagen, correo, celular } = req.body;

        const profesor = new Profesor({
            nombre,
            apellido,
            sexo,
            nacimiento,
            imagen,
            correo,
            celular
        });

        await profesor.save();
        res.status(201).json({
            msg: 'Usuario creado correctamente',
            profesor
        });
    } catch (error) {
        console.log(error);
        MsgError(res);
    }
}

const profeGet = async (req = request, res = response) => {
    const { id } = req.params;
    try {
        const profesor = await Profesor.findById(id);
        res.status(200).json({
            msg: 'Usuario encontrado',
            profesor
        })
    } catch (error) {
        console.log(error);
        MsgError(res);
    }
}

const profeUpdate = async (req = request, res = response) => {
    const { id } = req.params;
    const { _id, correo, imagen, ...resto } = req.body;

    try {
        const profesor = await Profesor.findByIdAndUpdate(id, resto);
        res.status(200).json(profesor);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
}

const profeDelete = async (req = request, res = response) => {
    const { id } = req.params;
    const profesor = await Profesor.findByIdAndDelete(id);

    res.json(profesor);
}

const notificacionesGet = async (req = request, res = response) => {
    const { id } = req.params;

    try {
        const profesor = await Profesor.findById(id);

        const notificaciones = profesor.notificaciones;
        res.status(200).json({ notificaciones });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const notificacionesDelete = async (req = request, res = response) => {
    const { id } = req.params;

    try {
        const profesor = await Profesor.findById(id)

        profesor.notificaciones = [];
        await profesor.save();

        return res.status(200).json({ mensaje: 'Notificaciones limpiadas correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    profePost,
    profeGet,
    profeUpdate,
    profeDelete,
    notificacionesGet,
    notificacionesDelete
}