const { response, request } = require('express');
const { MsgError } = require('../helpers/Myerror');
const Administrador = require('../models/Administrador');

const adminGet = async (req = request, res = response) =>{
    try {
        const profesor = await Administrador.find({
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

module.exports = {
    adminGet,
    adminUpdate
}