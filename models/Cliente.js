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

const ClienteSchema = new Schema({
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
    celular: {
        type: String,
        required: [true, 'El celular es obligatorio'],
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true
    },
    acreditados: {
        type: Number,
        default: 0
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
    desempeno: {
        type: Number,
        default: 0
    }
});

ClienteSchema.methods.toJSON = function () {
    const { __v, _id, ...cliente } = this.toObject();
    cliente.uid = _id;
    return cliente;
}

module.exports = model('Cliente', ClienteSchema);