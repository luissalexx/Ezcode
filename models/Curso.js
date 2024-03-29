const { Schema, model } = require('mongoose');

const TareaSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del tema es obligatorio']
    },
    url: {
        type: String,
        required: false
    },
    archivoId: {
        type: String,
        required: false
    },
    asignacion: {
        type: String,
        required: true,
    },
    entregada: {
        type: Boolean,
        required: true,
        default: false
    },
    calificacion: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const MensajeSchema = new Schema({
    usuarioId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    userName: {
        type: String,
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const TemaSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del tema es obligatorio']
    },
    contenido: {
        type: String,
    },
    url: {
        type: String,
    },
    pagado: {
        type: Boolean,
        required: true,
        default: false
    },
    precio: {
        type: Number,
        default: 1,
    },
});

const CursoSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    categoria: {
        type: String,
        required: [true, 'La categoria es obligatoria']
    },
    descripcion: {
        type: String,
        required: [true, 'La descripcion es obligatoria']
    },
    imagen: {
        type: String,
    },
    acreditado: {
        type: Boolean,
        required: true,
        default: false
    },
    calificacion: {
        type: Number,
        default: 0
    },
    alumno: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    profesor: {
        type: Schema.Types.ObjectId,
        ref: 'Profesor',
        required: true
    },
    anuncio: {
        type: Schema.Types.ObjectId,
        ref: 'Anuncio',
        required: true
    },
    carpeta: {
        type: String,
        default: ''
    },
    temas: [TemaSchema],
    historialMensajes: [MensajeSchema],
    tareas: [TareaSchema]
});

CursoSchema.methods.toJSON = function () {
    const { __v, _id, ...curso } = this.toObject();
    curso.uid = _id;
    return curso;
}

module.exports = model('Curso', CursoSchema);