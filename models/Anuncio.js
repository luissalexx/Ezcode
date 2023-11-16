const { Schema, model } = require('mongoose');

const AnuncioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    descripcion: {
        type: String,
        required: [true, 'La descripcion es obligatoria']
    },
    imagen: {
        type: String,
        required: false
    },
    precio: {
        type: String,
        required: [true, 'El precio es obligatorio'],
        unique: true
    },
    estado: {
        type: String,
        required: false
    },
});

AnuncioSchema.methods.toJSON = function(){
    const { __v, _id, ...anuncio} = this.toObject();
    anuncio.uid= _id;
    return anuncio;
}

module.exports = model( 'Anuncio', AnuncioSchema );