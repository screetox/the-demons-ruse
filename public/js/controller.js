const socket = io();
const customInput = document.getElementById('custom-input');
const userList = [];

// Login
socket.emit('start-controller');

// Log welcomeMessage from server; message = {id = str, text = str}
socket.on('welcomeMessage', (message) => {
    console.log(message.text);
});

// Receive players from server
socket.on('playersFromServer', (players) => {
    for (i = 0; i < players.length; i++) {
        userList.push(players[i]);
    }
    setupPlayersPoints();
});

// Setup players and points
function setupPlayersPoints() {
    const pointsDiv = document.getElementById('user-point-config');
    for (i = 0; i < userList.length; i++) {
        let div = document.createElement('div');
        div.innerHTML = `<div class="flex g16"><p class="w64">${userList[i].name}</p><input type="number" id="${userList[i].name}-points" class="w64 text-center" value="${userList[i].points}"></div>`;
        pointsDiv.children[pointsDiv.children.length - 1].before(div);
    }
}

// For testing purpose
function sendControllerMessage(command = customInput.value) {
    sendCommand(command);
}

// Send updated list of users
function sendUserList(list = userList) {
    sendCommand('update-user-list', list);
}

// Send updated list of users
function updateUserPoints() {
    for (i = 0; i < userList.length; i++) {
        const newP = document.getElementById(`${userList[i].name}-points`).value;
        if (newP != userList[i].points) {
            userList[i].points = parseInt(newP);
        }
    }
    socket.emit('update-user-points', userList);
}

// Sends commands from the controller to the display through the server
function sendCommand(command, args = '') {
    socket.emit('controller-to-display', {command: String(command), args: args});
}
