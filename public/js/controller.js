const socket = io();
const testInput = document.getElementById('test-input');

// Login
socket.emit('start-controller');

// Log welcomeMessage from server; message = {id = str, text = str}
socket.on('welcomeMessage', (message) => {
    console.log(message.text);
});

// For testing purpose
function sendTestMessage(command = testInput.value) {
    sendCommand(command);
}

// Send updated list of users
function sendUserList() {
    const userList = [
        {name: 'Elisa', points: 9},
        {name: 'Enrico', points: 7},
        {name: 'Josie', points: 5},
        {name: 'Julie', points: 11},
        {name: 'Linus', points: 17},
        {name: 'Markus', points: 19},
        {name: 'Maxi', points: 15},
        {name: 'Stefan', points: 13},
        {name: '9', points: 3},
        {name: '10', points: 1}
    ];
    sendCommand('update-user-list', userList);
}

// Send updated list of users
function updateUserPoints() {
    sendCommand('update-user-points', {username: 'maxi', amount: 14});
}

// Sends commands from the controller to the display through the server
function sendCommand(command, args = '') {
    socket.emit('controller-to-display', {command: String(command), args: args});
}
