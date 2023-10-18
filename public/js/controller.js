const socket = io();
const testInput = document.getElementById('test-input');

window.history.replaceState('', `The Demon's Ruse`, '/');

// Login
socket.emit('start-controller');

// Log welcomeMessage from server; message = {id = str, text = str}
socket.on('welcomeMessage', (message) => {
    console.log(message.text);
});

// For testing purpose
function sendTestMessage() {
    const command = testInput.value;
    sendCommand(command);
}

// Send updated list of users
function sendUserList() {
    const userList = [
        {name: 'Markus', points: 19}, {name: 'Linus', points: 17}, {name: 'Maxi', points: 15}, {name: 'Stefan', points: 13},
        {name: 'Julie', points: 11}, {name: 'Elisa', points: 9}, {name: 'Enrico', points: 7}, {name: 'Josie', points: 5}
    ];
    sendCommand('update-user-list', userList);
}

// Sends commands from the controller to the display through the server
function sendCommand(command, args = '') {
    socket.emit('controller-to-display', {command: String(command), args: args});
}
