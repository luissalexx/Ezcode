const { response, request } = require('express');
const Administrador = require('../models/Administrador')
const { MsgError } = require('../helpers/Myerror');

const adminGet = async (req = request, res = response) =>{
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

module.exports = {
    adminGet,
    adminUpdate
}