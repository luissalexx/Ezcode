const { Schema, model } = require('mongoose');

const ReporteSchema = new Schema({
    tipo: {
        type: String,
        required: [true, 'El tipo es obligatorio']
    },
    motivo: {
        type: String,
        required: [true, 'El mensaje es obligatorio']
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    curso: {
        type: Schema.Types.ObjectId,
        ref: 'Curso',
        required: true
    }
})

const NotificacionSchema = new Schema({
    mensaje: {
        type: String,
        required: [true, 'El mensaje es obligatorio']
    },

    fecha: {
        type: Date,
        default: Date.now
    }
});

const ProfeSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    apellido: {
        type: String,
        required: [true, 'Los apellidos son obligatorios']
    },
    sexo: {
        type: String,
        required: [true, 'El genero es obligatorio']
    },
    nacimiento: {
        type: Date,
        required: [true, 'La fecha de nacimiento es obligatoria']
    },
    imagen: {
        type: String,
    },
    limiteCursos: {
        type: Number,
        default: 0
    },
    celular: {
        type: String,
        required: [true, 'El celular es obligatorio'],
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true
    },
    notificaciones: [NotificacionSchema],
    baneado: {
        type: Boolean,
        default: false
    },
    puntosReportes: {
        type: Number,
        default: 0
    },
    reportes: [ReporteSchema],
    anuncios: {
        type: Number,
        default: 0
    }
});

ProfeSchema.methods.toJSON = function () {
    const { _id, __v, ...profesor } = this.toObject();
    profesor.uid = _id;
    return profesor;
}

module.exports = model('Profesor', ProfeSchema);