const jwt = require('jsonwebtoken');
const Profesor = require('../models/Profesor');
const Cliente = require('../models/Cliente');
const Curso = require('../models/Curso');

const connectedUsers = {};

function handleConnection(io, socket) {
    socket.on('disconnect', () => {
        handleDisconnect(io, socket);
    });

    socket.on('join course', ({ token, courseId }) => {
        handleJoinCourse(io, socket, token, courseId);
    });

    socket.on('chat message', ({ token, courseId, message }) => {
        handleChatMessage(io, socket, token, courseId, message);
    });
}

async function handleDisconnect(io, socket) {
    for (const courseId in connectedUsers) {
        const usersInCourse = connectedUsers[courseId];
        connectedUsers[courseId] = usersInCourse.filter(({ socketId }) => socketId !== socket.id);

        if (connectedUsers[courseId].length === 0) {
            delete connectedUsers[courseId];
        }
    }
}

async function handleJoinCourse(io, socket, token, courseId) {
    try {
        const decoded = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        const userId = decoded.userId;
        if (!connectedUsers[courseId]) {
            connectedUsers[courseId] = [];
        }
        connectedUsers[courseId].push({ socketId: socket.id, userId });

        socket.broadcast.to(courseId).emit('user joined', userId);
        socket.join(courseId);
    } catch (error) {
        console.error('Error al verificar el token:', error);
    }
}

async function handleChatMessage(io, socket, token, courseId, message) {
    try {
        const decoded = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        const usersInCourse = connectedUsers[courseId];
        if (usersInCourse) {
            const timestamp = new Date().toISOString();

            // Obtén la información del usuario, incluido el tipo
            const user = await findUserById(decoded.uid);

            if (user) {
                const chatMessage = {
                    usuarioId: decoded.uid,
                    userName: user.nombre,
                    message,
                    timestamp,
                };

                await saveChatMessageToDatabase(courseId, chatMessage);
                console.log(chatMessage);
                io.to(courseId).emit('chat message', chatMessage);

            }
        }
    } catch (error) {
        console.error('Error al verificar el token:', error);
    }
}

async function findUserById(userId) {
    try {
        const profesor = await Profesor.findById(userId);
        if (profesor) {
            return {
                nombre: profesor.nombre,
            };
        }

        const cliente = await Cliente.findById(userId);
        if (cliente) {
            return {
                nombre: cliente.nombre,
            };
        }

        return null;
    } catch (error) {
        console.error('Error al buscar usuario por ID:', error);
        return null;
    }
}

async function saveChatMessageToDatabase(courseId, chatMessage) {
    const maxMessages = 20
    try {
        const curso = await Curso.findById(courseId);

        if (curso) {
            curso.historialMensajes.push(chatMessage);

            // Verificar si se supera el límite de mensajes
            if (curso.historialMensajes.length > maxMessages) {
                // Eliminar los mensajes más antiguos
                const mensajesExcedentes = curso.historialMensajes.length - maxMessages;
                curso.historialMensajes.splice(0, mensajesExcedentes);
            }

            await curso.save();
        }
    } catch (error) {
        console.error('Error al guardar el mensaje en la base de datos:', error);
    }
}

module.exports = {
    handleConnection,
};