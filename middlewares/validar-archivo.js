const { response } = require("express")


const validarArchivoSubir = (req, res = response, next ) => {

    const files = req.files;

    if (!req.files || Object.keys(req.files).length === 0 || !req.files.archivo ) {
        return res.status(400).json({
            msg: 'No hay archivos que subir - validarArchivoSubir'
        });
    }
    console.log(files)
    next();

}


module.exports = {
    validarArchivoSubir
}
