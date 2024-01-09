const { response, request } = require('express');
const escapeRegexp = require("escape-string-regexp-node");
const Anuncio = require('../models/Anuncio');
const Cliente = require('../models/Cliente');
const Curso = require('../models/Curso');
const Profesor = require('../models/Profesor');

const coleccionesPermitidas = ['anuncios', 'cursos'];

const buscarAnuncio = async (termino = '', res = response) => {
    try {
        const profesor = await Profesor.findOne({ correo: termino });

        const escapedTermino = escapeRegexp(termino);
        const regex = new RegExp(escapedTermino, 'i');

        let query = {
            $or: [
                { nombre: regex },
                { categoria: termino },
            ],
        };

        if (profesor) {
            query.$or.push({ profesor: profesor._id });
        }

        if (!profesor) {
            query.$and = [{ estado: true }];
        }

        const anuncios = await Anuncio.find(query)
            .sort({ createdAt: -1 })
            .populate('profesor', 'nombre correo');

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
        let usuario;

        const cliente = await Cliente.findOne({ correo: termino });
        if (cliente) {
            usuario = cliente;
        } else {
            const profesor = await Profesor.findOne({ correo: termino });
            if (profesor) {
                usuario = profesor;
            } else {
                return res.json({
                    results: []
                });
            }
        }

        const cursos = await Curso.find({
            $and: [
                {
                    $or: [
                        { alumno: usuario._id },
                        { profesor: usuario._id }
                    ]
                }
            ]
        })
            .populate('profesor', 'nombre apellido correo')
            .populate('alumno', 'nombre apellido correo');

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