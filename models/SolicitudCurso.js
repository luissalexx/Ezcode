const { Schema, model } = require('mongoose');

const SolicitudCursoSchema = new Schema({
    estado: {
        type: Boolean,
        required: true,
        default: false
    },
    curso: {
        type: Schema.Types.ObjectId,
        ref: 'Curso',
        required: true
    },
    alumno: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    }
});

SolicitudCursoSchema.methods.toJSON = function(){
    const { __v, _id, ...solicitud} = this.toObject();
    solicitud.uid= _id;
    return solicitud;
}

module.exports = model( 'SolicitudCurso', SolicitudCursoSchema );