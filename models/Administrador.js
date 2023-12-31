const { Schema, model } = require('mongoose');

const NotificacionSchema = new Schema({
    mensaje: {
        type: String,
        required: [true, 'El mensaje es obligatorio']
    },
    fecha: {
        type: Date,
        default: Date.now,
    }
});


const AdministradorSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    apellido: {
        type: String,
        required: [true, 'Los apellidos son obligatorios']
    },
    imagen: {
        type: String,
    },
    nacimiento: {
        type: Date,
        required: [true, 'La fecha de nacimiento es obligatoria']
    },
    sexo: {
        type: String,
        required: [true, 'El genero es obligatorio']
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
    notificaciones: [NotificacionSchema]
});

AdministradorSchema.methods.toJSON = function () {
    const { _id, __v, ...administrador } = this.toObject();
    administrador.uid = _id;
    return administrador;
}

module.exports = model('Administrador', AdministradorSchema);