const socket = io();
const title = document.getElementById('title');
const points = document.getElementById('points');
const userPointsRow1 = document.getElementById('user-points-row1');
const userPointsRow2 = document.getElementById('user-points-row2');

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
    if (newUserList.length > 3) {
        for (let i = 0; i < Math.trunc((newUserList.length+1)/2); i++) {
            userPointsRow1.innerHTML += addUserPoints(newUserList[i]);
        }
        for (let i = Math.trunc((newUserList.length+1)/2); i < newUserList.length; i++) {
            userPointsRow2.innerHTML += addUserPoints(newUserList[i]);
        }
    } else {
        for (let i = 0; i < newUserList.length; i++) {
            userPointsRow1.innerHTML += addUserPoints(newUserList[i]);
        }
    }
});

function addUserPoints(user) {
    userList.push({name: user.name, points: user.points});
    return `
    <div class="flex column g16 m32">
        <img src="/img/testimgs/${user.name.toLowerCase()}.jpg" class="player-image">
        <h3>${user.name}</h3>
        <h3><span style="position: relative; top: -4px;">${user.points}</span> &#10022;</h3>
    </div>
    `;
}

// Update points of specific user
socket.on('update-user-points', (user, amount) => {

});

// Switch to points  overwiev
socket.on('show-points', () => {
    title.style.display = 'none';
    points.style.display = 'flex';
});

// Switch to title view
socket.on('show-title', () => {
    title.style.display = 'flex';
    points.style.display = 'none';
});
