const { Router } = require('express');
const { createAndShareFolder, uploadFileToFolder, deleteFileFromFolder } = require('../controllers/drivec');
const { validarArchivoSubir } = require('../middlewares/validar-archivo');

const router = Router();

router.post('/:alumnoCorreo/:profeCorreo/:nombreCarpeta/:idCurso', createAndShareFolder);

router.post('/upload/:folderId', validarArchivoSubir, uploadFileToFolder);

router.delete('/delete/:fileId/:idCurso/:idTarea', deleteFileFromFolder);

module.exports = router;