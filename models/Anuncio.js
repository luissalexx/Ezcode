const { Schema, model } = require('mongoose');

const AnuncioSchema = new Schema({
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
    precio: {
        type: Number,
        default: 1,
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
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

AnuncioSchema.methods.toJSON = function(){
    const { __v, _id, ...anuncio} = this.toObject();
    anuncio.uid= _id;
    return anuncio;
}

module.exports = model( 'Anuncio', AnuncioSchema );