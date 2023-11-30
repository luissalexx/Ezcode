const { Schema, model } = require('mongoose');

const AnuncioSchema = new Schema({
    nombre: {
        type: String,
        unique: true,
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
    precio: {
        type: Number,
        default: 0,
    },
    estado: {
        type: Boolean,
        required: true,
        default: false
    },
    profesor: {
        type: Schema.Types.ObjectId,
        ref: 'Profesor',
        required: true
    }
});

AnuncioSchema.methods.toJSON = function(){
    const { __v, _id, ...anuncio} = this.toObject();
    anuncio.uid= _id;
    return anuncio;
}

module.exports = model( 'Anuncio', AnuncioSchema );