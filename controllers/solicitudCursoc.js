const { response, request } = require('express');
const SolicitudCurso = require('../models/SolicitudCurso');

const solicitudPost = async (req, res) => {
    const data = {
        alumno: req.usuario._id,
        curso: req.body.curso
    };

    if (req.tipo === 'Cliente') {
        try {
            const solicitud = new SolicitudCurso(data);
            await solicitud.save();

            res.status(201).json(solicitud);
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los clientes pueden crear las solicitudes de cursos.' });
    }
};

const solicitudesGet = async (req = request, res = response) => {
    const { limite = 5, desde = 0 } = req.query;
    const query = { estado: false };

    if (req.tipo === 'Profesor') {

        const [total, solicitudes] = await Promise.all([
            SolicitudCurso.countDocuments(query),
            SolicitudCurso.find(query)
                .populate('alumno', 'nombre apellido correo')
                .populate('curso', 'nombre')
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        res.json({
            total,
            solicitudes
        })
    } else {
        res.status(403).json({ error: 'Solo los profesores pueden ver las solicitudes de cursos.' });
    }

}

const solicitudUpdate = async (req = request, res = response) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (req.tipo === 'Profesor') {
        try {
            const solicitud = await SolicitudCurso.findByIdAndUpdate(id, { estado: true }, { new: true });
            res.json(solicitud);
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los profesores pueden aprobar las solicitudes.' });
    }
}

const solicitudDelete = async (req = request, res = response) => {
    if (req.tipo === 'Profesor') {
        try {
            const { id } = req.params;
            const solicitud = await SolicitudCurso.findByIdAndDelete(id);

            res.json(solicitud);
        } catch (error) {
            res.status(400).json(error);
            console.log(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los profesores pueden quitar solicitudes.' });
    }
}

module.exports = {
    solicitudPost,
    solicitudesGet,
    solicitudUpdate,
    solicitudDelete
}