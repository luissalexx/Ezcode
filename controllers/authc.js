const { response, request } = require('express');
const { generarJWT } = require('../helpers/generar-jwt');
const { GoogleVerify } = require('../helpers/google-verify');
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } = process.env;
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID, { lazyLoading: true });
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
            else {
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

const revalidarToken = async (req = request, res = response) => {

    const { uid, name } = req;

    const token = await generarJWT(uid, name);

    res.json({
        ok: true,
        token
    })
}

const sendVerificationCode = async (req = request, res = response) => {
    const { celular } = req.body;
    try {
        const otpResponse = await client.verify.v2
            .services(TWILIO_SERVICE_SID)
            .verifications.create({
                to: `+52${celular}`,
                channel: "sms"
            });
        res.status(200).send(`OTP enviado: ${JSON.stringify(otpResponse)}`);
    } catch (error) {
        res.status(error?.status || 400).send(error?.message || 'Algo salió mal');
    }
}

const verifyCode = async (req = request, res = response) => {
    const { celular, otp } = req.body;
    try {
        const verifiedResponse = await client.verify.v2
            .services(TWILIO_SERVICE_SID)
            .verificationChecks.create({
                to: `+${celular}`,
                code: otp,
            });
        res.status(200).send(`OTP verificado: ${JSON.stringify(verifiedResponse)}`);
    } catch (error) {
        res.status(error?.status || 400).send(error?.message || 'Algo salió mal');
    }
}

module.exports = {
    googleSignIn,
    revalidarToken,
    sendVerificationCode,
    verifyCode
}
