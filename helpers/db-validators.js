const Administrador = require('../models/Administrador');
const Anuncio = require('../models/Anuncio');
const Cliente = require('../models/Cliente');
const Curso = require('../models/Curso');
const Profesor = require('../models/Profesor');
const SolicitudAnuncio = require('../models/SolicitudAnuncio');
const SolicitudCurso = require('../models/SolicitudCurso');

const EmailExiste = async (correo = '') =>{
    const existeEmail = await Cliente.findOne({correo});
    if (existeEmail) {
        console.log('El correo ya esta registrado')
        throw new Error('El correo ya esta registrado')
    }
}

const UsuarioExiste = async (id = '') =>{
    const existeUsuario = await Cliente.findById(id);
    if (!existeUsuario) {
        throw new Error('El id no existe')
    }
}

const EmailProfeExiste = async (correo = '') =>{
    const existeEmail = await Profesor.findOne({correo});
    if (existeEmail) {
        console.log('El correo ya esta registrado')
        throw new Error('El correo ya esta registrado')
    }
}

const ProfesorExiste = async (id = '') =>{
    const existeUsuario = await Profesor.findById(id);
    if (!existeUsuario) {
        throw new Error('El id no existe')
    }
}

const AdministradorExiste = async (id = '') =>{
    const existeUsuario = await Administrador.findById(id);
    if (!existeUsuario) {
        throw new Error('El id no existe')
    }
}

const AnuncioExiste = async (id = '') =>{
    const existeAnuncio = await Anuncio.findById(id);
    if (!existeAnuncio) {
        throw new Error('El id no existe')
    }
}

const SolicitudAnuncioExiste = async (id = '') =>{
    const existeSolicitud = await SolicitudAnuncio.findById(id);
    if (!existeSolicitud) {
        throw new Error('El id no existe')
    }
}

const SolicitudCursoExiste = async (id = '') =>{
    const existeSolicitud = await SolicitudCurso.findById(id);
    if (!existeSolicitud) {
        throw new Error('El id no existe')
    }
}

const EmailAdminExiste = async (correo = '') =>{
    const existeEmail = await Administrador.findOne({correo});
    if (existeEmail) {
        console.log('El correo ya esta registrado')
        throw new Error('El correo ya esta registrado')
    }
}

const CursoExiste = async (id = '') =>{
    const existeCurso = await Curso.findById(id);
    if (!existeCurso) {
        throw new Error('El id no existe')
    }
}

const coleccionesPermitidas = ( coleccion = '', colecciones = []) => {

    const incluida = colecciones.includes( coleccion );
    if ( !incluida ) {
        throw new Error(`La colección ${ coleccion } no es permitida, ${ colecciones }`);
    }
    return true;
}


module.exports = {
    EmailExiste,
    UsuarioExiste,
    EmailProfeExiste,
    ProfesorExiste,
    AdministradorExiste,
    EmailAdminExiste,
    coleccionesPermitidas,
    AnuncioExiste,
    SolicitudAnuncioExiste,
    CursoExiste,
    SolicitudCursoExiste
}