const { response, request } = require('express');
const Anuncio = require('../models/Anuncio');
const Profesor = require('../models/Profesor');

const anuncioPost = async (req = request, res = response) => {

    const { nombre, descripcion, categoria, imagen, precio } = req.body;

    const data = {
        nombre,
        descripcion,
        categoria,
        imagen,
        precio,
        profesor: req.usuario._id
    }

    if (req.tipo === 'Profesor') {
        try {
            const anuncio = new Anuncio(data);
            await anuncio.save();

            res.status(201).json(anuncio)
        } catch (error) {
            res.status(400).json(error)
        }
    } else {
        res.status(403).json({ error: 'Solo los profesores pueden crear anuncios.' });
    }

}

const anunciosGet = async (req = request, res = response) => {
    const query = {
        estado: true
    };

    const anuncios = await Anuncio.find(query)
        .sort({ createdAt: -1 })
        .populate('profesor', 'nombre apellido correo')

    res.json({
        results: anuncios
    })
}

const popularesGet = async (req = request, res = response) => {
    try {
        const anuncios = await Anuncio.find().sort({ calificacion: -1 }).populate('profesor', 'nombre apellido correo');

        if (!anuncios || anuncios.length === 0) {
            return res.status(404).json({ message: 'No se encontraron anuncios' });
        }

        res.json(anuncios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const anuncioGetById = async (req = request, res = response) => {
    const { id } = req.params;
    try {
        const anuncio = await Anuncio.findById(id).populate('profesor', 'nombre correo');
        res.status(200).json({
            msg: 'Anuncio encontrado',
            anuncio
        })
    } catch (error) {
        res.status(400).json(error);
    }
}

const anuncioUpdate = async (req = request, res = response) => {
    const { id } = req.params;
    const { estado, profesor, ...data } = req.body;

    data.profesor = req.usuario._id;
    data.estado = false;

    if (req.tipo === 'Profesor') {
        try {
            const anuncio = await Anuncio.findByIdAndUpdate(id, data, { new: true });

            const profesorId = anuncio.profesor;

            await Profesor.findByIdAndUpdate(
                profesorId,
                { $inc: { anuncios: -1 } },
                { new: true }
            );

            res.status(200).json(anuncio)
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los profesores pueden actualizar anuncios.' });
    }
}

const anuncioUpdateStatus = async (req = request, res = response) => {
    const { id } = req.params;

    if (req.tipo === 'Administrador') {
        try {
            const anuncio = await Anuncio.findByIdAndUpdate(id, { estado: true }, { new: true });

            const profesorId = anuncio.profesor;

            await Profesor.findByIdAndUpdate(
                profesorId,
                { $inc: { anuncios: 1 } },
                { new: true }
            );

            res.json(anuncio)
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los administradores pueden aprobar anuncios.' });
    }
}

const resenaPost = async (req, res) => {
    try {
        const { anuncioId, alumnoId } = req.params;
        const { estrellas } = req.body;

        const anuncio = await Anuncio.findById(anuncioId);

        if (!anuncio) {
            return res.status(404).json({ error: 'Anuncio no encontrado' });
        }

        const alumnoYaCalifico = anuncio.resena.some(resena => resena.alumno.toString() === alumnoId);

        if (alumnoYaCalifico) {
            return res.status(400).json({ error: 'El alumno ya ha realizado una reseña previa para este curso' });
        }

        const nuevaResena = {
            estrellas,
            alumno: alumnoId,
        };

        anuncio.resena.push(nuevaResena);

        actualizarTotalRating(anuncio);

        await anuncio.save();

        res.status(201).json({ message: 'Reseña creada con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const actualizarTotalRating = (anuncio) => {
    const totalResenas = anuncio.resena.length;
    const totalEstrellas = anuncio.resena.reduce((total, resena) => total + resena.estrellas, 0);

    anuncio.calificacion = totalResenas > 0 ? totalEstrellas / totalResenas : 0;
}

const resenasGet = async (req, res) => {
    try {
        const { anuncioId } = req.params;
        const anuncio = await Anuncio.findById(anuncioId).populate('resena.alumno');

        if (!anuncio) {
            return res.status(404).json({ error: 'Anuncio no encontrado' });
        }

        const resenas = anuncio.resena;

        res.status(200).json(resenas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
};

const anunciosDelete = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.tipo === 'Profesor') {
            const resultado = await Anuncio.deleteMany({ profesor: id });

            if (resultado.deletedCount > 0) {
                return res.json({ mensaje: `Se eliminaron los anuncios del profesor: ${id}` });
            } else {
                return res.json({ mensaje: `No se encontraron anuncios del profesor: ${id}` });
            }
        } else {
            return res.status(403).json({ mensaje: 'Acceso no autorizado.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

const anuncioDelete = async (req = request, res = response) => {
    if (req.tipo === 'Profesor') {
        try {
            const { id } = req.params;
            const anuncio = await Anuncio.findById(id);

            if (anuncio.estado) {
                const profesorId = anuncio.profesor;

                await Profesor.findByIdAndUpdate(
                    profesorId,
                    { $inc: { anuncios: -1 } },
                    { new: true }
                );
            }
            await Anuncio.findByIdAndDelete(id);

            res.json(anuncio);

        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor.' });
            console.error(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los profesores pueden borrar anuncios.' });
    }
}

module.exports = {
    anuncioPost,
    anunciosGet,
    popularesGet,
    anuncioGetById,
    anuncioUpdate,
    anuncioUpdateStatus,
    anuncioDelete,
    anunciosDelete,
    resenaPost,
    resenasGet
}
