const socket = io();
const title = document.getElementById('title');
const points = document.getElementById('points');
const sections = document.querySelectorAll(`[id^='section-']`);
const userPointsRow1 = document.getElementById('user-points-row1');
const userPointsRow2 = document.getElementById('user-points-row2');

// Login
socket.emit('start-display');
function initialFadeIn() {
    fadeInAll();
}

// Log welcome-message from server; message = {id = str, text = str}
socket.on('welcome-message', (message) => {
    console.log(message.text);
});

// Update list of users in case of new or deleted users
socket.on('players-from-server', (receivedList) => {
    userPointsRow1.innerHTML = '';
    userPointsRow2.innerHTML = '';
    const userList = [];
    for (let i = 0; i < receivedList.length; i++) {
        userList.push(receivedList[i]);
    }
    if (userList.length > 3) {
        for (let i = 0; i < Math.trunc((userList.length+1)/2); i++) {
            userPointsRow1.innerHTML += addUserDiv(userList[i]);
        }
        for (let i = Math.trunc((userList.length+1)/2); i < userList.length; i++) {
            userPointsRow2.innerHTML += addUserDiv(userList[i]);
        }
    } else {
        for (let i = 0; i < userList.length; i++) {
            userPointsRow1.innerHTML += addUserDiv(userList[i]);
        }
    }
});

function addUserDiv(user) {
    return `
    <div id="${user.name.toLowerCase()}-container" class="player-container flex column g16 m32"${user.points == 0 ? ' style="opacity: 0.5;"' : ''}>
        <img id="${user.name.toLowerCase()}-image" src="/img/playerimgs/${user.name.toLowerCase()}.jpg" class="player-image"${user.points == 0 ? ' style="filter: grayscale(100%);"' : ''}>
        <h3>${user.name}</h3>
        <div class="flex point-animation">
            <h3 class="w32 h32 relative">
                <span id="${user.name.toLowerCase()}-new-points">${user.points}</span>
                <span id="${user.name.toLowerCase()}-current-points">${user.points}</span>
            </h3>
            <h3>&#10022;</h3>
        </div>
    </div>
    `;
}

// Update points of specific user
socket.on('update-user-points', ({name, amount}) => {
    const currentPoints = document.getElementById(`${name.toLowerCase()}-current-points`);
    const newPoints = document.getElementById(`${name.toLowerCase()}-new-points`);
    const playerImage = document.getElementById(`${name.toLowerCase()}-image`);
    const playerContainer = document.getElementById(`${name.toLowerCase()}-container`);

    if ((currentPoints) && (newPoints)) {
        newPoints.innerHTML = `${amount}`;
        if (parseInt(currentPoints.innerHTML) > amount) {
            newPoints.style.transform = 'translate(-50%, 36px)';
            setTimeout(() => {
                currentPoints.style.transform = 'translate(-50%, -36px)';
                currentPoints.style.opacity = 0;

                newPoints.style.transform = 'translate(-50%, 0px)';
                newPoints.style.opacity = 1;

                setTimeout(() => {
                    currentPoints.innerHTML = `${amount}`;
                    currentPoints.style.transform = 'translate(-50%, 0px)';
                    setTimeout(() => {
                        currentPoints.style.opacity = 1;
                        setTimeout(() => {
                            newPoints.style.opacity = 0;
                        }, 400);
                    }, 500);
                }, 500);
            }, 500);
        } else if (parseInt(currentPoints.innerHTML) < amount) {
            newPoints.style.transform = 'translate(-50%, -36px)';
            setTimeout(() => {
                currentPoints.style.transform = 'translate(-50%, 36px)';
                currentPoints.style.opacity = 0;

                newPoints.style.transform = 'translate(-50%, 0px)';
                newPoints.style.opacity = 1;

                setTimeout(() => {
                    currentPoints.innerHTML = `${amount}`;
                    currentPoints.style.transform = 'translate(-50%, 0px)';
                    setTimeout(() => {
                        currentPoints.style.opacity = 1;
                        setTimeout(() => {
                            newPoints.style.opacity = 0;
                        }, 400);
                    }, 500);
                }, 500);
            }, 500);
        }
    }

    if (amount == 0) {
        if (playerContainer) {
            playerContainer.style.opacity = '0.5';
        }
        if (playerImage) {
            playerImage.style.filter = 'grayscale(100%)';
        }
    }
});

// Switch to title view
socket.on('show-title', () => {
    fadeOutAll();
    setTimeout(changeSectionOrder, 500, 'title');
    setTimeout(fadeInAll, 600);
});

// Switch to points  overwiev
socket.on('show-points', () => {
    fadeOutAll();
    setTimeout(changeSectionOrder, 500, 'points');
    setTimeout(fadeInAll, 600);
});

// Change section order
function changeSectionOrder(newTopSection) {
    let counter = 1;
    for (let i = 0; i < sections.length; i++) {
        if (sections[i].id === `section-${newTopSection}`) {
            sections[i].style.order = 0;
        } else {
            sections[i].style.order = counter;
            counter += 1;
        }
    }
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
