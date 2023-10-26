const express = require('express');
const cors = require('cors');
const { dbConnection } = require('../database/config')


class Server {

    constructor(){
        this.app = express();
        this.port = process.env.PORT;

        this.usuariosPath = '/api/user';
        this.profesoresPath = '/api/profesor';
        this.administradorPath = '/api/administrador';
        this.authPath = '/api/auth';

        //middlewares
        this.middlewares();

        //App Routes
        this.routes();

        //Database connection
        this.connection();

    }

    middlewares(){
        //CORS
        this.app.use(cors());

        //Lecture and parsing of the body
        this.app.use(express.json());

        //Public directory
        this.app.use(express.static('public'));
    }

    routes(){
        this.app.use(this.usuariosPath, require('../routes/user.routes'));
        this.app.use(this.profesoresPath, require('../routes/profesor.routes'));
        this.app.use(this.administradorPath, require('../routes/administrador.routes'));
        this.app.use(this.authPath, require('../routes/auth.routes'));
    }

    async connection(){
        await dbConnection();
    }

    listen(){
        this.app.listen( this.port, () => {
            console.log('Servidor corriendo en puerto', this.port );
        });
    }
}

module.exports = Server;