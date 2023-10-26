const { Schema, model } = require('mongoose');

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

ClienteSchema.methods.toJSON = function(){
    const { __v, _id, ...cliente } = this.toObject();
    cliente.uid= _id;
    return cliente;
}

module.exports = model( 'Cliente', ClienteSchema );