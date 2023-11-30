const { Schema, model } = require('mongoose');

const CursoSchema = new Schema({
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
        default: 0,
    },
    activo: {
        type: String,
        required: true,
        default: true
    },
    alumno: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    profesor: {
        type: Schema.Types.ObjectId,
        ref: 'Profesor',
        required: true
    }
    
});

CursoSchema.methods.toJSON = function(){
    const { __v, _id, ...curso} = this.toObject();
    curso.uid= _id;
    return curso;
}

module.exports = model( 'Curso', CursoSchema );