const express = require('express');
const cors = require('cors');
const { dbConnection } = require('../database/config')
const fileUpload = require('express-fileupload');
const { handleConnection } = require('../controllers/socketsc');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT;
        this.server = require('http').createServer(this.app);
        this.io = require('socket.io')(this.server, {
            cors: {
                origin: process.env.CLIENT_HOST
            }
        });

        this.usuariosPath = '/api/user';
        this.profesoresPath = '/api/profesor';
        this.administradorPath = '/api/admin';
        this.authPath = '/api/auth';
        this.uploadPath = '/api/uploads';
        this.anuncioPath = '/api/anuncio';
        this.cursoPath = '/api/curso';
        this.solicitudAnuncioPath = '/api/solicitudA';
        this.solicitudCursoPath = '/api/solicitudC';
        this.busquedaPath = '/api/busqueda';
        this.paymentPath = '/api/pago';
        this.drivePath = '/api/drive';
        this.calendarPath = '/api/calendar';

        //middlewares
        this.middlewares();

        //App Routes
        this.routes();

        //Database connection
        this.connection();

        this.sockets();

    }

    middlewares() {
        //CORS
        this.app.use(cors());

        //Lecture and parsing of the body
        this.app.use(express.json());

        //Public directory
        this.app.use(express.static('public'));

        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/',
            createParentPath: true
        }));
    }

    routes() {
        this.app.use(this.usuariosPath, require('../routes/user.routes'));
        this.app.use(this.profesoresPath, require('../routes/profesor.routes'));
        this.app.use(this.administradorPath, require('../routes/administrador.routes'));
        this.app.use(this.authPath, require('../routes/auth.routes'));
        this.app.use(this.uploadPath, require('../routes/upload.routes'));
        this.app.use(this.anuncioPath, require('../routes/anuncio.routes'));
        this.app.use(this.cursoPath, require('../routes/curso.routes'));
        this.app.use(this.solicitudAnuncioPath, require('../routes/solicitudAnuncio.routes'));
        this.app.use(this.solicitudCursoPath, require('../routes/solicitudCurso.routes'));
        this.app.use(this.busquedaPath, require('../routes/busqueda.routes'));
        this.app.use(this.paymentPath, require('../routes/payment.routes'));
        this.app.use(this.drivePath, require('../routes/drive.routes'));
        this.app.use(this.calendarPath, require('../routes/calendar.routes'));
    }

    async connection() {
        await dbConnection();
    }

    sockets() {
        this.io.on('connection', (socket) => {
            handleConnection(this.io, socket);
            console.log(`cliente conectado: ${socket}`);
        });
    }

    listen() {
        this.server.listen(this.port, () => {
            console.log('Servidor corriendo en puerto', this.port);
        });
    }
}

module.exports = Server;