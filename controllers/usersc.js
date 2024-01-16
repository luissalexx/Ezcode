const { response, request } = require('express');
const { validationResult } = require('express-validator');
const { MsgError } = require('../helpers/Myerror');
const Cliente = require('../models/Cliente');

const userPost = async (req = request, res = response) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json(error);
        }

        const { nombre, apellido, sexo, nacimiento, imagen, correo, celular } = req.body;

        const cliente = new Cliente({
            nombre,
            apellido,
            sexo,
            nacimiento,
            imagen,
            correo,
            celular,
        });

        await cliente.save();
        res.status(201).json({
            msg: 'Usuario creado correctamente',
            cliente
        });

    } catch (error) {
        console.log(error);
        MsgError(res);
    }
}

const userGet = async (req = request, res = response) => {
    const { id } = req.params;
    try {
        const alumno = await Cliente.findById(id);
        res.status(200).json({
            msg: 'Usuario encontrado',
            alumno
        })
    } catch (error) {
        console.log(error);
        MsgError(res);
    }
}


const userUpdate = async (req = request, res = response) => {
    const { id } = req.params;
    const { _id, correo, imagen, ...resto } = req.body;

    try {
        const usuario = await Cliente.findByIdAndUpdate(id, resto);
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const userDelete = async (req = request, res = response) => {
    const { id } = req.params;
    const usuario = await Cliente.findByIdAndDelete(id);

    res.json(usuario);
}

const notificacionesGet = async (req = request, res = response) => {
    const { id } = req.params;

    try {
        const cliente = await Cliente.findById(id);

        const notificaciones = cliente.notificaciones;
        res.status(200).json({ notificaciones });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const notificacionesDelete = async (req = request, res = response) => {
    const { id } = req.params;

    try {
        const cliente = await Cliente.findById(id)

        cliente.notificaciones = [];
        await cliente.save();

        return res.status(200).json({ mensaje: 'Notificaciones limpiadas correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const reportarUsusario = async (req = request, res = response) => {
    const { userId, curso } = req.params;
    const { tipo, motivo } = req.body;

    try {
        const cliente = await Cliente.findById(userId);

        const reporte = {
            tipo,
            motivo,
            curso
        };

        cliente.reportes.push(reporte);
        await cliente.save();

        res.status(200).json(reporte);

    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

const buscarClientesConReportes = async (req = request, res = response) => {
    try {

        const clientesConReportes = await Cliente.find({ "reportes": { $exists: true, $not: { $size: 0 } } });

        return res.status(200).json(clientesConReportes);
    } catch (error) {
        console.error('Error al buscar clientes con reportes:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
}

const reportesGet = async (req = request, res = response) => {
    const { userId } = req.params;

    try {
        const cliente = await Cliente.findById(userId);

        if (!cliente) {
            return res.json({ mensaje: 'Cliente no encontrado.' });
        }

        return res.status(200).json(cliente.reportes);
    } catch (error) {
        console.error('Error al buscar reportes por usuario:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

const sumarPuntos = async (req = request, res = response) => {
    const { userId } = req.params;
    const { puntos } = req.body;

    try {
        const cliente = await Cliente.findById(userId);
        if (!cliente) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado.' });
        }

        cliente.puntosReportes += puntos;
        await cliente.save();

        return res.status(200).json(cliente.puntosReportes);
    } catch (error) {
        console.error('Error al actualizar puntosReporte:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

const restarPuntos = async (req = request, res = response) => {
    const { userId } = req.params;
    const { puntos } = req.body;

    try {
        const cliente = await Cliente.findById(userId);
        if (!cliente) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado.' });
        }

        cliente.puntosReportes -= puntos;
        await cliente.save();

        return res.status(200).json(cliente.puntosReportes);
    } catch (error) {
        console.error('Error al actualizar puntosReporte:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

const reporteDelete = async (req, res) => {
    const { userId, reporteId } = req.params;

    try {
        if (req.tipo === "Administrador") {

            const cliente = await Cliente.findById(userId);
            if (!cliente) {
                return res.json({ mensaje: 'Cliente no encontrado.' });
            }

            const indiceReporte = cliente.reportes.findIndex(report => report._id.toString() === reporteId);

            if (indiceReporte === -1) {
                return res.status(404).json({ mensaje: 'Reporte no encontrado.' });
            }

            cliente.reportes.splice(indiceReporte, 1);

            await cliente.save();
            return res.status(200).json(cliente);
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
        const cliente = await Cliente.findById(userId);

        if (!cliente) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado.' });
        }

        cliente.reportes = [];
        await cliente.save();

        return res.status(200).json(cliente);
    } catch (error) {
        console.error('Error al eliminar los reportes de un usuario:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

const banearAlumno = async (req, res) => {
    const { userId } = req.params;

    if (req.tipo === "Administrador") {
        try {
            const cliente = await Cliente.findById(userId);
            if (!cliente) {
                return res.status(404).json({ mensaje: 'Cliente no encontrado.' });
            }

            cliente.baneado = true;
            await cliente.save();

            return res.status(200).json(cliente);
        } catch (error) {
            console.error('Error al cambiar el valor de baneado:', error);
            return res.status(500).json({ mensaje: 'Error interno del servidor.' });
        }
    } else {
        res.status(500).json({ error: 'Solo los administradores pueden banear usuarios' });
    }
};

const desbanearAlumno = async (req, res) => {
    const { userId } = req.params;

    if (req.tipo === "Administrador") {
        try {
            const cliente = await Cliente.findById(userId);
            if (!cliente) {
                return res.status(404).json({ mensaje: 'Cliente no encontrado.' });
            }

            if (cliente.baneado == true) {
                cliente.baneado = false;
                await cliente.save();
                return res.status(200).json(cliente);
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
    userPost,
    userGet,
    userUpdate,
    userDelete,
    notificacionesGet,
    notificacionesDelete,
    reportarUsusario,
    buscarClientesConReportes,
    reportesGet,
    sumarPuntos,
    restarPuntos,
    reporteDelete,
    banearAlumno,
    reportesDelete,
    desbanearAlumno
}