const socket = io();
const title = document.getElementById('title');
const points = document.getElementById('points');
const userPointsRow1 = document.getElementById('user-points-row1');
const userPointsRow2 = document.getElementById('user-points-row2');

window.history.replaceState('', `The Demon's Ruse`, '/');

const userList = [];

// Login
socket.emit('start-display');

// Log welcomeMessage from server; message = {id = str, text = str}
socket.on('welcomeMessage', (message) => {
    console.log(message.text);
});

// Update list of users in case of new or deleted users
socket.on('update-user-list', (newUserList) => {
    userList.length = 0;
    userPointsRow1.innerHTML = '';
    userPointsRow2.innerHTML = '';
    for (let i = 0; i < Math.trunc((newUserList.length+1)/2); i++) {
        userList.push({name: newUserList[i].name, points: newUserList[i].points});
        userPointsRow1.innerHTML += `<p>${newUserList[i].name} - ${newUserList[i].points}</p>`;
    }
    for (let i = Math.trunc((newUserList.length+1)/2); i < newUserList.length; i++) {
        userList.push({name: newUserList[i].name, points: newUserList[i].points});
        userPointsRow2.innerHTML += `<p>${newUserList[i].name} - ${newUserList[i].points}</p>`;
    }
});

// Update points of specific user
socket.on('update-user-points', (user, amount) => {

});

socket.on('show-points', () => {
    title.style.display = 'none';
    points.style.display = 'flex';
});
