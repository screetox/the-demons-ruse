const socket = io();
const sections = document.querySelectorAll(`[id^='section-']`);
const userList = [];

// Login
socket.emit('start-controller');
function initialFadeIn() {
    changeSection('main');
}

// Log welcome-message from server; message = {id = str, text = str}
socket.on('welcome-message', (message) => {
    console.log(message.text);
});

// Receive players from server
socket.on('players-from-server', (players) => {
    for (i = 0; i < players.length; i++) {
        userList.push(players[i]);
    }
    setupPlayersPoints();
    setupPlayersVirusGame();
});

// Setup players and points
function setupPlayersPoints() {
    const pointsDiv = document.getElementById('user-point-config');
    for (i = 0; i < userList.length; i++) {
        let div = document.createElement('div');
        div.innerHTML = `<div class="flex g16"><p class="w86">${userList[i].name}</p><input type="number" id="${userList[i].name.toLowerCase()}-points" class="w86 text-center" value="${userList[i].points}" min="0"></div>`;
        pointsDiv.children[pointsDiv.children.length - 1].before(div);
    }
}

// Send updated list of users
function updateUserPoints() {
    for (i = 0; i < userList.length; i++) {
        const newP = document.getElementById(`${userList[i].name.toLowerCase()}-points`).value;
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

// Change section order
function changeSection(newTopSection) {
    fadeOutAll();
    setTimeout(oneSectionVisible, 1000, newTopSection);
}

// Play video on display
function playVideo(videoPath, videoLength) {
    sendCommand('play-video', {videoPath, videoLength});
}

// Play video on display
function showImage(imagePath) {
    sendCommand('show-image', imagePath);
}

// Make one specific section visible
function oneSectionVisible(visibleSection) {
    for (let i = 0; i < sections.length; i++) {
        if (sections[i].id === `section-${visibleSection}`) {
            sections[i].style.display = 'flex';
        } else {
            sections[i].style.display = 'none';
        }
    }
    setTimeout(fadeInAll, 10);
}

// Fade in all sections
function fadeInAll() {
    for (let i = 0; i < sections.length; i++) {
        sections[i].classList.add('visible');
    }
};

// Fade out all sections
function fadeOutAll() {
    for (let i = 0; i < sections.length; i++) {
        sections[i].classList.remove('visible');
    }
};


// Virus Game

// Setup players for virus game
function setupPlayersVirusGame() {
    const playerSelect = document.getElementById('playerselect');
    for (i = 0; i < userList.length; i++) {
        let option = document.createElement('option');
        option.value = `${userList[i].name.toLowerCase()}`;
        option.innerHTML = `${userList[i].name}`;
        if (i == 0) {
            option.selected = true;
        }
        playerSelect.appendChild(option);
    }
}

// Show player death in virus game
function showDeathVirusGame() {
    const playerSelect = document.getElementById('playerselect');
    const roleSelect = document.getElementById('roleselect');
    const killedByVirus = document.getElementById('killed-by-virus');
    sendCommand('virus-game-death', {player: playerSelect.value, role: roleSelect.value, virusKill: killedByVirus.checked});
}

// Show player death in virus game
function showInfectedVirusGame() {
    const numberInfected = document.getElementById('number-infected');
    sendCommand('virus-game-infected', numberInfected.value);
}

// Show that the cure is  in virus game
function showCureVirusGame() {
    sendCommand('virus-game-cure');
}

// Show that the cure is  in virus game
function showWinVirusGame(winCondition) {
    sendCommand('virus-game-win', winCondition);
}


// Rules Game

// Setup new group rules
function changeGroupRuleRulesGame() {
    const r1 = document.getElementById('rulesselect-1').value;
    const r2 = document.getElementById('rulesselect-2').value;
    const r3 = document.getElementById('rulesselect-3').value;

    sendCommand('change-group-rule-rules-game', {r1, r2, r3});
}
