const { response, request } = require('express');
const SolicitudAnuncio = require('../models/SolicitudAnuncio');

const solicitudPost = async (req, res) => {
    const data = {
        profesor: req.usuario._id,
        anuncio: req.body.anuncio
    };

    if (req.tipo === 'Profesor') {
        try {
            const solicitud = new SolicitudAnuncio(data);
            await solicitud.save();

            res.status(201).json(solicitud);
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los profesores pueden crear las solicitudes de anuncios.' });
    }
};

const solicitudesGet = async (req = request, res = response) => {
    const { limite = 5, desde = 0 } = req.query;
    const query = { estado: false };

    if (req.tipo === 'Administrador') {

        const [total, solicitudes] = await Promise.all([
            SolicitudAnuncio.countDocuments(query),
            SolicitudAnuncio.find(query)
                .populate('profesor', 'nombre apellido correo')
                .populate('anuncio', 'nombre')
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        res.json({
            total,
            solicitudes
        })
    } else {
        res.status(403).json({ error: 'Solo los administradores pueden ver las solicitudes de anuncios.' });
    }

}

const solicitudUpdate = async (req = request, res = response) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (req.tipo === 'Administrador') {
        try {
            const solicitud = await SolicitudAnuncio.findByIdAndUpdate(id, { estado: true }, { new: true });
            res.json(solicitud);
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los administradores pueden aprobar las solicitudes.' });
    }
}

const solicitudDelete = async (req = request, res = response) => {
    if (req.tipo === 'Administrador') {
        try {
            const { id } = req.params;
            const solicitud = await SolicitudAnuncio.findByIdAndDelete(id);

            res.json(solicitud);
        } catch (error) {
            res.status(400).json(error);
            console.log(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los administradores pueden quitar solicitudes.' });
    }
}

module.exports = {
    solicitudPost,
    solicitudesGet,
    solicitudUpdate,
    solicitudDelete
}