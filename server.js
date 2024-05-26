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

// Initialize players and read from file
var players = JSON.parse(`[{"name": "Player", "points": 0}]`);
fs.readFile('players.json', 'utf8', (err, data) => {
    if (err) {
        console.log(err);
    } else {
        players = JSON.parse(data);
    }
});

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', (socket) => {
    socket.on('start-display', () => {
        socket.emit('welcome-message', formatMessage(botName, `Willkommen bei The Demon's Ruse, du verwendest die Display-Funktion!`));
        socket.emit('players-from-server', players);
        socket.join('display');
        console.log(`${socket.id} connected as display.`);
    });
    socket.on('start-controller', () => {
        socket.emit('welcome-message', formatMessage(botName, `Willkommen bei The Demon's Ruse, du verwendest die Controller-Funtkion!`));
        socket.emit('players-from-server', players);
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

    // Update points for specific user, save to players.json
    socket.on('update-user-points', (args) => {
        for (i = 0; i < args.length; i++) {
            const user = args[i].name;
            const points = parseInt(args[i].points);
            if ((players[i].name == user) && (players[i].points != args[i].points)) {
                players[i].points = points;
                io.to('display').emit('update-user-points', {name: user, amount: points});
            }
        }
        fs.writeFile('players.json', JSON.stringify(players), 'utf8', (err) => {
            if (err) {
                console.log(err);
            }
        });
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
