const { response, request } = require('express');
const Curso = require('../models/Curso');

const cursoPost = async (req = request, res = response) => {

    const { nombre, descripcion, categoria, imagen, precio } = req.body;

    const data = {
        nombre,
        descripcion,
        categoria,
        imagen,
        precio,
        profesor: req.usuario._id,
        alumno: req.body.alumno
    }

    if (req.tipo === 'Profesor') {
        try {
            const curso = new Curso(data);
            await curso.save();

            res.status(201).json(curso)
        } catch (error) {
            res.status(400).json(error)
        }
    } else {
        res.status(403).json({ error: 'Solo los profesores pueden crear cursos.' });
    }
}

const cursoGet = async (req = request, res = response) => {
    const { id } = req.params;
    try {
        const curso = await Curso.findById(id)
        res.status(200).json({
            msg: 'Curso encontrado',
            curso
        })
    } catch (error) {
        res.status(400).json(error);
    }
}

const cursoUpdate = async (req = request, res = response) => {
    const { id } = req.params;
    const { activo, profesor, ...data } = req.body;

    data.profesor = req.usuario._id;

    if (req.tipo === 'Profesor') {
        try {
            const curso = await Curso.findByIdAndUpdate(id, data);
            res.json(curso)
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los profesores pueden actualizar cursos.' });
    }
}

const cursoUpdateStatus = async (req = request, res = response) => {
    const { id } = req.params;
    const { activo } = req.body;

    if (req.tipo === 'Profesor') {
        try {
            const curso = await Curso.findByIdAndUpdate(id, { estado: false }, { new: true });
            res.json(curso)
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los profesores pueden finalizar cursos.' });
    }
}

const cursoDelete = async (req = request, res = response) => {
    if (req.tipo === 'Cliente') {
        try {
            const { id } = req.params;
            const curso = await Curso.findByIdAndDelete(id);

            res.json(curso);
        } catch (error) {
            res.status(400).json(error);
            console.log(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los clientes pueden borrar cursos.' });
    }
}

module.exports = {
    cursoPost,
    cursoGet,
    cursoUpdate,
    cursoUpdateStatus,
    cursoDelete
}