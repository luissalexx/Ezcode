const { response, request } = require('express');
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
        res.status(400).json(error)
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

const reportarProfesor = async (req = request, res = response) => {
    const { userId, curso } = req.params;
    const { tipo, motivo } = req.body;

    try {
        const profesor = await Profesor.findById(userId);

        const reporte = {
            tipo,
            motivo,
            curso
        };

        profesor.reportes.push(reporte);
        await profesor.save();

        res.status(200).json(reporte);

    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

const buscarProfesoresConReportes = async (req = request, res = response) => {
    try {
        const profesoresConReportes = await Profesor.find({ "reportes": { $exists: true, $not: { $size: 0 } } });

        return res.status(200).json(profesoresConReportes);
    } catch (error) {
        console.error('Error al buscar profesores con reportes:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
}

const reportesGet = async (req = request, res = response) => {
    const { userId } = req.params;

    try {
        const profesor = await Profesor.findById(userId);

        if (!profesor) {
            return res.json({ mensaje: 'Profesor no encontrado.' });
        }

        return res.status(200).json(profesor.reportes);
    } catch (error) {
        console.error('Error al buscar reportes por usuario:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

const sumarPuntos = async (req = request, res = response) => {
    const { userId } = req.params;
    const { puntos } = req.body;

    try {
        const profesor = await Profesor.findById(userId);
        if (!profesor) {
            return res.status(404).json({ mensaje: 'Profesor no encontrado.' });
        }

        profesor.puntosReportes += puntos;
        await profesor.save();

        return res.status(200).json(profesor.puntosReportes);
    } catch (error) {
        console.error('Error al actualizar puntosReporte:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

const restarPuntos = async (req = request, res = response) => {
    const { userId } = req.params;
    const { puntos } = req.body;

    try {
        const profesor = await Profesor.findById(userId);
        if (!profesor) {
            return res.status(404).json({ mensaje: 'Profesor no encontrado.' });
        }

        profesor.puntosReportes -= puntos;
        await profesor.save();

        return res.status(200).json(profesor.puntosReportes);
    } catch (error) {
        console.error('Error al actualizar puntosReporte:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

const reporteDelete = async (req, res) => {
    const { userId, reporteId } = req.params;

    try {
        if (req.tipo === "Administrador") {

            const profesor = await Profesor.findById(userId);
            if (!profesor) {
                return res.json({ mensaje: 'Profesor no encontrado.' });
            }

            const indiceReporte = profesor.reportes.findIndex(report => report._id.toString() === reporteId);

            if (indiceReporte === -1) {
                return res.status(404).json({ mensaje: 'Reporte no encontrado.' });
            }

            profesor.reportes.splice(indiceReporte, 1);

            await profesor.save();
            return res.status(200).json(profesor);
        } else {
            return res.status(500).json({ mensaje: 'Solo los administradores pueden borrar reportes' });
        }
    } catch (error) {
        console.error('Error al quitar un reporte:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

const reportesDelete = async (req, res) => {
    const { userId } = req.params;

    try {
        const profesor = await Profesor.findById(userId);

        if (!profesor) {
            return res.status(404).json({ mensaje: 'Profesor no encontrado.' });
        }

        profesor.reportes = [];
        await profesor.save();

        return res.status(200).json(profesor);
    } catch (error) {
        console.error('Error al eliminar los reportes de un usuario:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

const banearProfesor = async (req, res) => {
    const { userId } = req.params;

    if (req.tipo === "Administrador") {
        try {
            const profesor = await Profesor.findById(userId);
            if (!profesor) {
                return res.status(404).json({ mensaje: 'Profesor no encontrado.' });
            }

            profesor.baneado = true;
            await profesor.save();

            return res.status(200).json(profesor);
        } catch (error) {
            console.error('Error al cambiar el valor de baneado:', error);
            return res.status(500).json({ mensaje: 'Error interno del servidor.' });
        }
    } else {
        res.status(500).json({ error: 'Solo los administradores pueden banear usuarios' });
    }
};

const desbanearProfesor = async (req, res) => {
    const { userId } = req.params;

    if (req.tipo === "Administrador") {
        try {
            const profesor = await Profesor.findById(userId);
            if (!profesor) {
                return res.status(404).json({ mensaje: 'Profesor no encontrado.' });
            }

            if (profesor.baneado == true) {
                profesor.baneado = false;
                await profesor.save();
                return res.status(200).json(profesor);
            } else {
                return res.status(500).json({ mensaje: 'El usuario no esta baneado' });
            }

        } catch (error) {
            console.error('Error al cambiar el valor de baneado:', error);
            return res.status(500).json({ mensaje: 'Error interno del servidor.' });
        }
    } else {
        res.status(500).json({ error: 'Solo los administradores pueden desbanear usuarios' });
    }
};

module.exports = {
    profePost,
    profeGet,
    profeUpdate,
    profeDelete,
    notificacionesGet,
    notificacionesDelete,
    reportarProfesor,
    buscarProfesoresConReportes,
    reportesGet,
    sumarPuntos,
    restarPuntos,
    reporteDelete,
    reportesDelete,
    banearProfesor,
    desbanearProfesor
}