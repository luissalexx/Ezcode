const { Schema, model } = require('mongoose');

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
        required: false
    },
    celular: {
        type: String,
        required: [true, 'El celular es obligatorio'],
        unique: true
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true
    },

});

ProfeSchema.methods.toJSON = function(){
    const { __v, ...profesor } = this.toObject();
    return profesor;
}

module.exports = model( 'Profesor', ProfeSchema );