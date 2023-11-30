const { response } = require('express');
const escapeRegexp = require("escape-string-regexp-node");
const Anuncio = require('../models/Anuncio');
const Cliente = require('../models/Cliente');
const Curso = require('../models/Curso');
const { ObjectId } = require('mongoose').Types;

const coleccionesPermitidas = ['anuncios', 'cursos'];

const buscarAnuncio = async (termino = '', res = response) => {
    try {
        const esMongoID = ObjectId.isValid(termino);

        if (esMongoID) {
            const anuncio = await Anuncio.findById(termino).populate('profesor', 'nombre correo');
            return res.json({
                results: anuncio ? [anuncio] : []
            });
        }

        const escapedTermino = escapeRegexp(termino);
        const regex = new RegExp(escapedTermino, 'i');

        const anuncios = await Anuncio.find({
            $or: [
                { nombre: regex },
                { categoria: regex },
            ],
            $and: [{ estado: false }]
        }).populate('profesor', 'nombre correo');

        console.log(anuncios)

        res.json({
            results: anuncios
        });
    } catch (error) {
        console.error("Error en la búsqueda de anuncios:", error, "Término de búsqueda:", termino);
        res.status(500).json({
            msg: 'Error en la búsqueda de anuncios.'
        });
    }
};

const buscarCursoPorCorreo = async (termino = '', res = response) => {
    try {

        const alumno = await Cliente.findOne({ correo: termino });
        if (!alumno) {
            return [];
        }

        const cursos = await Curso.find({
            $and: [
                { activo: true },
                { alumno: alumno._id }
            ]
        })

        res.json({
            results: cursos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Error en la búsqueda de cursos.'
        });
    }
};


const buscar = (req, res = response) => {
    const { coleccion, termino } = req.params;

    if (!coleccionesPermitidas.includes(coleccion)) {
        return res.status(400).json({
            msg: `Las colecciones permitidas son: ${coleccionesPermitidas}`
        });
    }

    switch (coleccion) {
        case 'anuncios':
            buscarAnuncio(termino, res);
            break;
        case 'cursos':
            buscarCursoPorCorreo(termino, res);
            break;

        default:
            res.status(500).json({
                msg: 'Se me olvidó hacer esta búsqueda'
            });
    }
};

module.exports = {
    buscar
};