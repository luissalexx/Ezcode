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
            msg:'Usuario creado correctamente',
            profesor
        });
    } catch (error) {
        console.log(error);
        MsgError(res);
    }
}

const profeGet = async (req = request, res = response) =>{
    try {
        const profesor = await Profesor.find({
            nombre: req.query.nombre
        });
        res.status(200).json({
            msg:'Usuario encontrado',
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
        const usuario = await Profesor.findByIdAndUpdate(id, resto);
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const profeDelete = async (req = request, res = response) => {
    const { id } = req.params;
    const usuario = await Profesor.findByIdAndDelete(id);

    res.json(usuario);
}

module.exports = {
    profePost,
    profeGet,
    profeUpdate,
    profeDelete
}