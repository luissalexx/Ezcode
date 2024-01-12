const { response, request } = require('express');
const SolicitudCurso = require('../models/SolicitudCurso');
const Anuncio = require('../models/Anuncio');
const Profesor = require('../models/Profesor');
const Cliente = require('../models/Cliente');
const Curso = require('../models/Curso');

const solicitudPost = async (req, res) => {
    const data = {
        alumno: req.usuario._id,
        anuncio: req.body.anuncio,
        profesor: req.body.profesor
    };

    if (req.tipo === 'Cliente') {
        try {
            const solicitud = new SolicitudCurso(data);
            await solicitud.save();

            const anuncio = await Anuncio.findById(solicitud.anuncio);
            const profesor = await Profesor.findById(anuncio.profesor);

            profesor.notificaciones.push({
                mensaje: `Ha llegado una nueva solicitud del curso: ${anuncio.nombre}`
            });
            await profesor.save();

            res.status(201).json(solicitud);
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los clientes pueden crear las solicitudes de cursos.' });
    }
};

const solicitudesGet = async (req = request, res = response) => {
    const query = { estado: false, pagado: false };

    if (req.tipo !== 'Administrador') {

        const solicitudes = await SolicitudCurso.find(query)
            .populate('alumno', 'nombre apellido correo acreditados desempeno puntosReportes')
            .populate('profesor', 'nombre apellido correo')
            .populate('anuncio', 'nombre categoria precio')

        res.json({
            solicitudes
        })
    } else {
        res.status(403).json({ error: 'No tienes los permisos para ver las solicitudes' });
    }
}

const solicitudesAceptadasGet = async (req = request, res = response) => {
    const query = { estado: true, pagado: false };

    if (req.tipo !== 'Administrador') {

        const solicitudes = await SolicitudCurso.find(query)
            .populate('alumno', 'nombre apellido correo')
            .populate('profesor', 'nombre apellido correo')
            .populate('anuncio', 'nombre categoria precio')

        res.json({
            solicitudes
        })
    } else {
        res.status(403).json({ error: 'No tienes los permisos para ver las solicitudes' });
    }

}

const solicitudUpdate = async (req = request, res = response) => {
    const { id } = req.params;

    if (req.tipo === 'Profesor') {
        try {
            const solicitud = await SolicitudCurso.findByIdAndUpdate(id, { estado: true }, { new: true });

            const idProfesor = solicitud.profesor._id;
            await Profesor.findByIdAndUpdate(idProfesor, { $inc: { limiteCursos: 1 } }, { new: true });

            const alumno = await Cliente.findById(solicitud.alumno);
            const anuncio = await Anuncio.findById(solicitud.anuncio);

            const data = {
                nombre: anuncio.nombre,
                descripcion: anuncio.descripcion,
                categoria: anuncio.categoria,
                imagen: anuncio.imagen,
                profesor: solicitud.profesor,
                alumno: alumno.uid,
                anuncio: anuncio._id
            };

            if (anuncio.precio === 0) {
                anuncio.suscripciones = anuncio.suscripciones + 1;
                await anuncio.save();
                
                const curso = new Curso(data);
                await curso.save();

                alumno.notificaciones.push({
                    mensaje: `Se ha creado el curso: ${curso.nombre}, revisa tu panel de cuenta`,
                });
                await alumno.save();

                await SolicitudCurso.findByIdAndDelete(solicitud._id);

                return;
            }

            alumno.notificaciones.push({
                mensaje: `Han aprobado tu solicitud del curso: ${anuncio.nombre}`
            });
            await alumno.save();

            res.json(solicitud);
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los profesores pueden aprobar las solicitudes.' });
    }
}

const solicitudGetByAnuncio = async (req = request, res = response) => {
    try {
        const anuncioId = req.params.anuncioId;
        let solicitud = await SolicitudCurso.findOne({ anuncio: anuncioId });
        return res.json(solicitud);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const solicitudesDelete = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.tipo === 'Cliente') {
            const resultado = await SolicitudCurso.deleteMany({ profesor: id });

            if (resultado.deletedCount > 0) {
                return res.json({ mensaje: `Se eliminaron los solicitudes del cliente: ${id}` });
            } else {
                return res.json({ mensaje: `No se encontraron solicitudes del cliente: ${id}` });
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
    solicitudesAceptadasGet,
    solicitudGetByAnuncio,
    solicitudUpdate,
    solicitudDelete,
    solicitudesDelete,
}