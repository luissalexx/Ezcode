const { response, request } = require('express');
const SolicitudAnuncio = require('../models/SolicitudAnuncio');
const Profesor = require('../models/Profesor');
const Administrador = require('../models/Administrador');
const Anuncio = require('../models/Anuncio');
const AdminID = process.env.ADMINID;

const solicitudPost = async (req, res) => {
    const data = {
        profesor: req.usuario._id,
        anuncio: req.body.anuncio
    };

    if (req.tipo === 'Profesor') {
        try {
            const solicitud = new SolicitudAnuncio(data);
            await solicitud.save();

            const admin = await Administrador.findById(AdminID);
            admin.notificaciones.push({
                mensaje: `Ha llegado una nueva solicitud de anuncio`
            });
            await admin.save();

            res.status(201).json(solicitud);
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los profesores pueden crear las solicitudes de anuncios.' });
    }
};

const solicitudesGet = async (req = request, res = response) => {
    const query = { estado: false };

    if (req.tipo === 'Administrador') {

        const solicitudes = await SolicitudAnuncio.find(query)
            .populate('profesor', 'nombre apellido correo anuncios puntosReportes')
            .populate('anuncio', 'nombre categoria precio')

        res.json({
            solicitudes
        })
    } else {
        res.status(403).json({ error: 'Solo los administradores pueden ver las solicitudes de anuncios.' });
    }

}

const solicitudUpdate = async (req = request, res = response) => {
    const { id } = req.params;

    if (req.tipo === 'Administrador') {
        try {
            const solicitud = await SolicitudAnuncio.findByIdAndUpdate(id, { estado: true }, { new: true });

            const profesor = await Profesor.findById(solicitud.profesor);
            const anuncio = await Anuncio.findById(solicitud.anuncio)
            profesor.notificaciones.push({
                mensaje: `Han aprobado la solicitud de tu anuncio: ${anuncio.nombre}`
            });
            await profesor.save();

            res.json(solicitud);
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los administradores pueden aprobar las solicitudes.' });
    }
}

const solicitudGetByAnuncio = async (req = request, res = response) => {
    try {
        const anuncioId = req.params.anuncioId;
        let solicitud = await SolicitudAnuncio.findOne({ anuncio: anuncioId });
        return res.json(solicitud);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const solicitudesDelete = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.tipo === 'Profesor') {
            const resultado = await SolicitudAnuncio.deleteMany({ profesor: id });

            if (resultado.deletedCount > 0) {
                return res.json({ mensaje: `Se eliminaron los solicitudes del profesor: ${id}` });
            } else {
                return res.json({ mensaje: `No se encontraron solicitudes del profesor: ${id}` });
            }
        } else {
            return res.status(403).json({ mensaje: 'Acceso no autorizado.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

const solicitudDelete = async (req = request, res = response) => {
    if (req.tipo !== 'Cliente') {
        try {
            const { id } = req.params;

            const solicitud = await SolicitudAnuncio.findByIdAndDelete(id);

            res.json(solicitud);
        } catch (error) {
            res.status(400).json(error);
            console.log(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los administradores y profesores pueden quitar solicitudes.' });
    }
}

module.exports = {
    solicitudPost,
    solicitudesGet,
    solicitudUpdate,
    solicitudDelete,
    solicitudGetByAnuncio,
    solicitudesDelete
}