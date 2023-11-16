const { Schema, model } = require('mongoose');

const CursoSchema = new Schema({
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

CursoSchema.methods.toJSON = function(){
    const { __v, _id, ...curso} = this.toObject();
    curso.uid= _id;
    return curso;
}

module.exports = model( 'Curso', CursoSchema );