const { response, request } = require('express');
const Anuncio = require('../models/Anuncio');

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

    if (req.tipo === 'Profesor') {
        try {
            const anuncio = await Anuncio.findByIdAndUpdate(id, {estado: false}, data);
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
    const { estado } = req.body;

    if (req.tipo === 'Administrador') {
        try {
            const anuncio = await Anuncio.findByIdAndUpdate(id, { estado: true }, { new: true });
            res.json(anuncio)
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los administradores pueden aprobar anuncios.' });
    }
}

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
            const anuncio = await Anuncio.findByIdAndDelete(id);

            res.json(anuncio);
        } catch (error) {
            res.status(400).json(error);
            console.log(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los profesores pueden borrar anuncios.' });
    }
}

module.exports = {
    anuncioPost,
    anunciosGet,
    anuncioGetById,
    anuncioUpdate,
    anuncioUpdateStatus,
    anuncioDelete,
    anunciosDelete
}