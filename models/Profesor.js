const { Schema, model } = require('mongoose');

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
    notificaciones: [NotificacionSchema]

});

ProfeSchema.methods.toJSON = function () {
    const { _id, __v, ...profesor } = this.toObject();
    profesor.uid = _id;
    return profesor;
}

module.exports = model('Profesor', ProfeSchema);