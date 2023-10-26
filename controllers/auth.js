const { response, request } = require('express');
const { generarJWT } = require('../helpers/generar-jwt');
const { GoogleVerify } = require('../helpers/google-verify');
const Cliente = require('../models/Cliente');
const Profesor = require('../models/Profesor');
const Administrador = require('../models/Administrador');

const googleSignIn = async (req = request, res = response) => {

    const { id_token } = req.body;

    try {
        const { correo } = await GoogleVerify(id_token);
        var tipo = '';

        let usuario = await Profesor.findOne({ correo });

        if (usuario) {
            tipo = 'Profesor'
        } else {
            usuario = await Cliente.findOne({ correo });
            if (usuario) {
                tipo = 'Alumno'
            }
            else{
                usuario = await Administrador.findOne({ correo });
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

        const token = await generarJWT(usuario.id);

        return res.status(200).json({
            ok: true,
            token,
            tipo
        })

    } catch (error) {
        console.log(error);
        res.status(400).json({
            ok: false,
            msg: 'El token no se pudo verificar'
        })
    }
}

const revalidarToken = async (req, res = response) => {

    const {uid, name} = req;

    const token = await generarJWT(uid, name);

    res.json({
        ok: true,
        token
    })
}


module.exports = {
    googleSignIn,
    revalidarToken
}
