const { response } = require("express");

const extensionesPermitidas = ['jpg', 'jpeg', 'png', 'pdf', 'mp4', 'docx', 'pptx', 'xlsx'];

const validarArchivoSubir = (req, res = response, next) => {

    if (!req.files || Object.keys(req.files).length === 0 || !req.files.archivo) {
        return res.status(400).json({
            msg: 'No hay archivos que subir - validarArchivoSubir'
        });
    }

    const extension = req.files.archivo.name.split('.').pop().toLowerCase();

    if (!extensionesPermitidas.includes(extension)) {
        return res.status(400).json({
            msg: 'La extensión del archivo no está permitida'
        });
    }
    
    next();
};

module.exports = {
    validarArchivoSubir
};