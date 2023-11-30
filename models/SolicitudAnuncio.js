const { Schema, model } = require('mongoose');

const SolicitudAnuncioSchema = new Schema({
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
    anuncio: {
        type: Schema.Types.ObjectId,
        ref: 'Anuncio',
        required: true
    }
});

SolicitudAnuncioSchema.methods.toJSON = function(){
    const { __v, _id, ...solicitud} = this.toObject();
    solicitud.uid= _id;
    return solicitud;
}

module.exports = model( 'SolicitudAnuncio', SolicitudAnuncioSchema );