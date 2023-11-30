const path = require('path');

const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL);

const { response } = require('express');
const Cliente = require('../models/Cliente');
const Profesor = require('../models/Profesor');
const Administrador = require('../models/Administrador');

const actualizarImagenCloudinary = async (req, res = response) => {

    const { id, coleccion } = req.params;

    let modelo;

    switch (coleccion) {
        case 'clientes':
            modelo = await Cliente.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un usuario con el id ${id}`
                });
            }

            break;

        case 'profesors':
            modelo = await Profesor.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un producto con el id ${id}`
                });
            }

            break;

        case 'administradors':
            modelo = await Administrador.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un producto con el id ${id}`
                });
            }

            break;

        default:
            return res.status(500).json({ msg: 'Se me olvidó validar esto' });
    }

    if (modelo.imagen) {
        const nombreArr = modelo.imagen.split('/');
        const nombre = nombreArr[nombreArr.length - 1];
        const [public_id] = nombre.split('.');
        cloudinary.uploader.destroy(public_id);
    }

    const { tempFilePath } = req.files.archivo
    const { secure_url } = await cloudinary.uploader.upload(tempFilePath);
    modelo.imagen = secure_url;
    
    await modelo.save();
    res.json(modelo);

}

const mostrarImagen = async (req, res = response) => {
    const { id, coleccion } = req.params;

    let modelo;

    switch (coleccion) {
        case 'clientes':
            modelo = await Cliente.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un usuario con el id ${id}`,
                });
            }

            break;

        case 'profesors':
            modelo = await Profesor.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un usuario con el id ${id}`,
                });
            }

            break;

        case 'administradors':
            modelo = await Administrador.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un usuario con el id ${id}`,
                });
            }

            break;

        default:
            return res.status(500).json({ msg: 'Se me olvidó validar esto' });
    }

    if (modelo.imagen) {
        return res.redirect(modelo.imagen);
    }

    const pathImagen = path.join(__dirname, '../assets/default.jpg');
    res.sendFile(pathImagen);
};

module.exports = {
    mostrarImagen,
    actualizarImagenCloudinary
}