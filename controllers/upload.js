const path = require('path');
const fs = require('fs');

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

    const esImagenPredeterminada = modelo.imagen === '../assets/default.jpg';

    // Limpiar imágenes previas
    if (!esImagenPredeterminada) {
        // Limpiar imágenes previas
        if (modelo.imagen) {
            const nombreArr = modelo.imagen.split('/');
            const nombre = nombreArr[nombreArr.length - 1];
            const [public_id] = nombre.split('.');
            await cloudinary.uploader.destroy(public_id);
        }

        // Subir la nueva imagen a Cloudinary
        const { tempFilePath } = req.files.archivo;
        const { secure_url } = await cloudinary.uploader.upload(tempFilePath);
        modelo.imagen = secure_url;
    }

    await modelo.save();
    console.log(modelo)
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
                    msg: `No existe un producto con el id ${id}`,
                });
            }

            break;

        case 'administradors':
            modelo = await Administrador.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un producto con el id ${id}`,
                });
            }

            break;

        default:
            return res.status(500).json({ msg: 'Se me olvidó validar esto' });
    }

    // Limpiar imágenes previas
    if (modelo.imagen) {
        // Hay que borrar la imagen del servidor
        const pathImagen = path.join(__dirname, '../uploads', coleccion, modelo.imagen);
        if (fs.existsSync(pathImagen)) {
            return res.sendFile(pathImagen);
        }
    }

    const pathImagen = path.join(__dirname, '../assets/default.jpg');
    res.sendFile(pathImagen);
};

module.exports = {
    mostrarImagen,
    actualizarImagenCloudinary
}