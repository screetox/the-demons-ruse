const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const PORT = 4269;
const io = socketio(server, { maxHttpBufferSize: 1e8 });
const botName = 'Server';

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', (socket) => {
    socket.on('start-display', () => {
        socket.emit('welcomeMessage', formatMessage(botName, `Willkommen bei The Demon's Ruse, du verwendest die Display-Funktion!`));
        socket.join('display');
        console.log(`${socket.id} connected as display.`);
    });
    socket.on('start-controller', () => {
        socket.emit('welcomeMessage', formatMessage(botName, `Willkommen bei The Demon's Ruse, du verwendest die Controller-Funtkion!`));
        socket.join('controller');
        console.log(`${socket.id} connected as controller.`);
    });

    // Sending commands from controller to display
    socket.on('controller-to-display', (msg) => {
        if (msg.args) {
            io.to('display').emit(msg.command, msg.args);
        } else {
            io.to('display').emit(msg.command);
        }
    });
});

// Format message to send
function formatMessage(id, text) {
    return {
        id,
        text
    };
}

server.listen(PORT, () => console.log(`Server running on localhost:${PORT}`));
