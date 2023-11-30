const { response, request } = require('express');
const Anuncio = require('../models/Anuncio');

const anuncioPost = async (req = request, res = response) => {

    const { nombre, descripcion, categoria, imagen, precio } = req.body;
    const anuncioDB = await Anuncio.findOne({ nombre });

    if (anuncioDB) {
        return res.status(400).json({
            msg: `El anuncio ${anuncioDB.nombre} ya existe`
        });
    }

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
    const { limite = 5, desde = 0 } = req.query;
    const query = {};

    const [total, anuncios] = await Promise.all([
        Anuncio.countDocuments(query),
        Anuncio.find(query)
            .populate('profesor', 'nombre apellido correo')
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    res.json({
        total,
        anuncios
    })
}

const anuncioGetById = async (req = request, res = response) => {
    const { id } = req.params;
    try {
        const anuncio = await Anuncio.findById(id)
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
            const anuncio = await Anuncio.findByIdAndUpdate(id, data);
            res.json(anuncio)
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
    anuncioDelete
}