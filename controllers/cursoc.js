const { response, request } = require('express');
const Curso = require('../models/Curso');
const Cliente = require('../models/Cliente');
const schedule = require('node-schedule');
const Profesor = require('../models/Profesor');

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
    const { activo, profesor, alumno, anuncio, ...data } = req.body;

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
    const { calificacion } = req.body;

    if (req.tipo === 'Profesor') {
        try {
            const curso = await Curso.findByIdAndUpdate(
                id,
                { $set: { acreditado: true, calificacion } },
                { new: true }
            );

            if (curso.acreditado == true) {
                const idAlumno = curso.alumno._id;
                await Cliente.findByIdAndUpdate(idAlumno, { $inc: { acreditados: 1 } }, { new: true });

                const idProfesor = curso.profesor._id;
                await Profesor.findByIdAndUpdate(idProfesor, { $inc: { limiteCursos: -1 } }, { new: true });

                res.json(curso);
                scheduleCourseDeletion(id)
            }

        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los profesores pueden finalizar cursos.' });
    }
}

const scheduleCourseDeletion = (cursoId) => {
    const year = new Date();
    year.setFullYear(year.getFullYear() + 1);

    schedule.scheduleJob(year, async () => {
        try {
            await Curso.findByIdAndDelete(cursoId);
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    });
}

const cursoDelete = async (req = request, res = response) => {
    if (req.tipo === 'Cliente') {
        try {
            const { id } = req.params;
            const curso = await Curso.findById(id)

            if (curso.acreditado == false) {
                const idProfesor = curso.profesor._id;
                await Profesor.findByIdAndUpdate(idProfesor, { $inc: { limiteCursos: -1 } }, { new: true });
            }

            const borrarCurso = await Curso.findByIdAndDelete(id);
            res.json(borrarCurso);

        } catch (error) {
            res.status(400).json(error);
            console.log(error);
        }
    } else {
        res.status(403).json({ error: 'Solo los clientes pueden borrar cursos.' });
    }
}

const cursosDelete = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.tipo === 'Cliente') {
            const resultado = await Curso.deleteMany({ alumno: id });

            if (resultado.deletedCount > 0) {
                return res.json({ mensaje: `Se eliminaron los cursos del alumno: ${id}` });
            } else {
                return res.json({ mensaje: `No se encontraron cursos del alumno: ${id}` });
            }
        } else {
            return res.status(403).json({ mensaje: 'Acceso no autorizado.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
};

const temaPost = async (req = request, res = response) => {
    const { id } = req.params;
    const { nombre, contenido, url, precio } = req.body;

    try {
        const curso = await Curso.findById(id);

        if (!curso) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        const nuevoTema = {
            nombre,
            contenido,
            url,
            precio
        };

        if (precio === 0) {
            nuevoTema.pagado = true;
        }

        curso.temas.push(nuevoTema);
        await curso.save();

        res.status(200).json(curso);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const temasGet = async (req, res) => {
    const { id } = req.params;

    try {
        const curso = await Curso.findOne({ _id: id }, { temas: 1 });

        if (!curso) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        const temas = curso.temas;
        res.status(200).json({ temas });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const temaGetById = async (req, res) => {
    const { id, idTema } = req.params;

    try {
        const curso = await Curso.findOne({ _id: id }, { temas: 1 });

        if (!curso) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        const temaEncontrado = curso.temas.find(tema => tema._id == idTema);

        if (!temaEncontrado) {
            return res.status(404).json({ error: 'Tema no encontrado en el curso' });
        }

        res.status(200).json({ temaEncontrado });

    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const temaPut = async (req = request, res = response) => {
    const { id, idTema } = req.params;
    const { nombre, contenido, precio, url } = req.body;

    if (req.tipo === 'Profesor') {
        try {
            const curso = await Curso.findById(id);

            if (!curso) {
                return res.status(404).json({ error: 'Curso no encontrado' });
            }

            const tema = curso.temas.id(idTema);

            if (!tema) {
                return res.status(404).json({ error: 'Tema no encontrado' });
            }

            if (precio === 0) {
                tema.pagado = true;
            }

            tema.nombre = nombre || tema.nombre;
            tema.contenido = contenido || tema.contenido;
            tema.url = url || tema.url;
            tema.precio = precio || tema.precio;

            await curso.save();

            res.status(200).json({ tema });
        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    } else {
        res.status(403).json({ error: 'Solo los profesores pueden actualizar temas.' });
    }
};

const temaDelete = async (req = request, res = response) => {
    const { id, temaId } = req.params;

    if (req.tipo === 'Profesor') {
        try {
            const curso = await Curso.findById(id);

            if (!curso) {
                return res.status(404).json({ error: 'Curso no encontrado' });
            }

            curso.temas.pull({ _id: temaId });

            await curso.save();

            res.status(200).json({ mensaje: 'Tema eliminado con éxito' });
        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    } else {
        res.status(403).json({ error: 'Solo los profesores pueden borrar temas.' });
    }

};

const tareasPost = async (req = request, res = response) => {
    const { id } = req.params;
    const { nombre, asignacion } = req.body;

    try {
        const curso = await Curso.findById(id);

        if (!curso) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        const nuevoTask = {
            nombre,
            asignacion
        };

        curso.tareas.push(nuevoTask);
        await curso.save();

        res.status(200).json(curso);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

const tareaGetById = async (req, res) => {
    const { id, idTarea } = req.params;

    try {
        const curso = await Curso.findOne({ _id: id }, { tareas: 1 });

        if (!curso) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        const tareaEncontrada = curso.tareas.find(tarea => tarea._id == idTarea);

        if (!tareaEncontrada) {
            return res.status(404).json({ error: 'Tarea no encontrada en el curso' });
        }

        res.status(200).json(tareaEncontrada);

    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const tareasPendientesGet = async (req, res) => {
    const { id } = req.params;

    try {
        const curso = await Curso.findById(id);

        if (!curso) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        const pendientes = curso.tareas.filter((tarea) => !tarea.entregada);

        res.status(200).json(pendientes);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const tareasEntregadasGet = async (req, res) => {
    const { id } = req.params;

    try {
        const curso = await Curso.findById(id);

        if (!curso) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        const entregadas = curso.tareas.filter((tarea) => tarea.entregada);

        res.status(200).json(entregadas);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const tareaPut = async (req = request, res = response) => {
    const { id, tareaId } = req.params;
    const { nombre, asignacion } = req.body;

    try {
        if (req.tipo === 'Profesor') {

            const curso = await Curso.findById(id);

            if (!curso) {
                return res.status(404).json({ error: 'Curso no encontrado' });
            }

            const tarea = curso.tareas.id(tareaId);

            if (!tarea) {
                return res.status(404).json({ error: 'Tarea no encontrada' });
            }

            tarea.nombre = nombre || tarea.nombre;
            tarea.asignacion = asignacion || tarea.asignacion;
            await curso.save();

            res.status(200).json({ mensaje: 'Asignacion modificada' });
        } else {
            res.status(403).json({ error: 'Solo los profesores pueden editar las asignaciones.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const entregarTarea = async (req = request, res = response) => {
    try {
        const { id, tareaId } = req.params;
        const { url, archivoId } = req.body;

        if (req.tipo === 'Cliente') {

            const curso = await Curso.findById(id);

            if (!curso) {
                return res.status(404).json({ error: 'Curso no encontrado' });
            }

            const tarea = curso.tareas.id(tareaId);

            if (!tarea) {
                return res.status(404).json({ error: 'Tarea no encontrada' });
            }

            tarea.url = url || tarea.url;
            tarea.archivoId = archivoId || tarea.archivoId;
            tarea.entregada = true;
            await curso.save();

            res.status(200).json({ mensaje: 'Tarea entregada' });
        } else {
            res.status(403).json({ error: 'Solo los alumnos pueden entregar tareas.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const calificarTarea = async (req = request, res = response) => {
    const { cursoId, tareaId } = req.params;
    const { calificacion } = req.body;

    try {
        const curso = await Curso.findById(cursoId);

        if (!curso) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        const tareaIndex = curso.tareas.findIndex(t => t._id.toString() === tareaId);

        if (tareaIndex === -1) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        curso.tareas[tareaIndex].calificacion = calificacion;
        await curso.save();

        res.json({ message: 'Tarea calificada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const tareaDelete = async (req = request, res = response) => {
    try {
        const { id, tareaId } = req.params;

        const curso = await Curso.findById(id);

        if (!curso) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        curso.tareas.pull(tareaId);
        await curso.save();

        res.status(200).json({ mensaje: 'Tarea eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    cursoGet,
    cursoUpdate,
    cursoUpdateStatus,
    cursoDelete,
    cursosDelete,
    temaPost,
    temasGet,
    temaGetById,
    temaPut,
    temaDelete,
    tareasPost,
    tareaGetById,
    tareasPendientesGet,
    tareasEntregadasGet,
    entregarTarea,
    tareaPut,
    calificarTarea,
    tareaDelete
}