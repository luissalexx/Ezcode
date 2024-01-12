const { response, request } = require('express');
const { google } = require('googleapis');
const Curso = require('../models/Curso');
const { Readable } = require('stream');
const fs = require('fs').promises;
const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY } = process.env;

const drive = google.drive({
    version: 'v3',
    auth: new google.auth.JWT(
        GOOGLE_CLIENT_EMAIL,
        null,
        GOOGLE_PRIVATE_KEY,
        ['https://www.googleapis.com/auth/drive']
    ),
});

const createAndShareFolder = async (req = request, res = response) => {
    const { alumnoCorreo, profeCorreo, nombreCarpeta, idCurso } = req.params;

    try {
        const curso = await Curso.findById(idCurso);

        if (!curso) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        const folderId = await createFolder(nombreCarpeta);
        await shareFolder(folderId, profeCorreo);
        await shareFolder(folderId, alumnoCorreo);

        curso.carpeta = folderId;
        await curso.save();

        res.status(200).json({ mensaje: 'Carpeta creada y compartida exitosamente' });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

const createFolder = async (folderName) => {
    try {
        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            visibility: 'anyoneCanRead'
        };

        const folder = await drive.files.create({
            resource: folderMetadata,
            fields: 'id',
        });

        return folder.data.id;
    } catch (error) {
        throw new Error(`Error al crear la carpeta: ${error.message}`);
    }
};

const shareFolder = async (folderId, emailAddress) => {
    try {
        await drive.permissions.create({
            fileId: folderId,
            resource: {
                role: 'writer',
                type: 'user',
                emailAddress: emailAddress,
            },
        });

        console.log(`Carpeta compartida exitosamente con ${emailAddress}`);
    } catch (error) {
        throw new Error(`Error al compartir la carpeta: ${error.message}`);
    }
};

const uploadFileToFolder = async (req, res) => {
    const { folderId } = req.params;

    try {
        if (!folderId || !req.files || !req.files.archivo) {
            return res.status(400).json({ error: 'Folder ID or file not provided' });
        }

        const fileData = await fs.readFile(req.files.archivo.tempFilePath);
        const fileStream = Readable.from(fileData);

        const fileMetadata = {
            name: req.files.archivo.name,
            parents: [folderId],
        };

        const media = {
            mimeType: req.files.archivo.mimetype,
            body: fileStream,
        };

        const uploadedFile = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id,webViewLink',
        });
 
        const fileId = uploadedFile.data.id;
        const fileUrlEmbedded = `https://drive.google.com/file/d/${fileId}/preview`;
        const fileUrl = uploadedFile.data.webViewLink

        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        await fs.unlink(req.files.archivo.tempFilePath);

        res.status(200).json({ fileUrlEmbedded, fileUrl, fileId });
    } catch (error) {
        console.error('Error:', error.message || error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteFileFromFolder = async (req, res) => {
    const { fileId, idCurso, idTarea } = req.params;

    try {
        if (!fileId) {
            return res.status(400).json({ error: 'File ID not provided' });
        }

        const response = await drive.files.delete({
            fileId: fileId,
        });

        if (response) {

            const curso = await Curso.findById(idCurso);
            if (!curso) {
                return res.status(404).json({ error: 'Curso no encontrado' });
            }

            const tarea = curso.tareas.id(idTarea);
            if (!tarea) {
                return res.status(404).json({ error: 'Tarea no encontrada' });
            }

            tarea.entregada = false;
            tarea.url = '';
            tarea.archivoId = '';
            await curso.save();

            res.status(200).json({ message: 'File deleted successfully' });
        }
    } catch (error) {
        console.error('Error:', error.message || error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createAndShareFolder,
    uploadFileToFolder,
    deleteFileFromFolder
}