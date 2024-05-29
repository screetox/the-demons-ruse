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

// Update list of users
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
    switchToSection('title');
});

// Switch to points overview
socket.on('show-points', () => {
    switchToSection('points');
});

// Switch to specific section with fade
function switchToSection(section) {
    fadeOutAll();
    setTimeout(changeSectionOrder, 1000, section);
    setTimeout(fadeInAll, 1100);
}

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

// Play video in fullscreen
socket.on('play-video', ({videoName, videoLength}) => {
    const videoTag = document.getElementById('video-display');

    setTimeout(() => {
        videoTag.src = `vid/${videoName}.mp4`;
        videoTag.load();
    }, 1000);
    setTimeout(() => {
        videoTag.play();
        console.log(videoTag.duration)
    }, 1100);

    switchToSection('video');

    setTimeout(() => {
        switchToSection('title');
    }, videoLength + 100);
});


// Virus Game

// Show death of player in virus game
socket.on('virus-game-death', ({player, role, virusKill}) => {
    const deadPlayerImg = document.getElementById('dead-player');
    const deadPlayerRoleImg = document.getElementById('dead-player-role');
    const deathMessage = document.getElementById('death-message');

    deadPlayerImg.style.opacity = 0;
    deadPlayerRoleImg.style.opacity = 0;
    setTimeout(() => {
        if (virusKill) {
            deathMessage.innerHTML = 'Das Virus hat einen Spieler getötet:';
        } else {
            deathMessage.innerHTML = 'Ein Spieler wurde getötet:';
        }

        deadPlayerImg.src = `img/playerimgs/${player}.jpg`;
        deadPlayerRoleImg.src = `img/virus-game/${role}.png`;
        deadPlayerImg.style.transform = 'translateX(calc(50% + 32px))';
        deadPlayerRoleImg.style.transform = 'translateX(calc(-50% - 32px))';
    }, 1000);

    switchToSection('virus-game-death');

    setTimeout(() => {
        deadPlayerImg.style.opacity = 1;
    }, 3100);
    setTimeout(() => {
        deadPlayerImg.style.transform = 'translateX(0%)';
        deadPlayerRoleImg.style.opacity = 1;
        deadPlayerRoleImg.style.transform = 'translateX(0%)';
    }, 5100);
});

// Show number of infected players
socket.on('virus-game-infected', (countInfected) => {
    const infectedCount = document.getElementById('infected-count');

    infectedCount.style.opacity = 0;
    setTimeout(() => {
        infectedCount.innerHTML = `${countInfected}`;
    }, 1000);

    switchToSection('virus-game-infected');

    setTimeout(() => {
        infectedCount.style.opacity = 1;
    }, 3100);
});

// Show number of infected players
socket.on('virus-game-cure', () => {
    const cureText = document.getElementById('cure-text');
    cureText.style.opacity = 0;

    switchToSection('virus-game-cure');

    setTimeout(() => {
        cureText.style.opacity = 1;
    }, 3100);
});

// Show number of infected players
socket.on('virus-game-win', (condition) => {
    const winGroupImg = document.getElementById('win-group');
    const winConditionImg = document.getElementById('win-condition');
    const winMessage = document.getElementById('win-text');

    winGroupImg.style.opacity = 0;
    winConditionImg.style.opacity = 0;
    winMessage.style.opacity = 0;
    setTimeout(() => {
        if (condition == 'cure') {
            winMessage.innerHTML = 'Die Bürger gewinnen durch die erfolgreiche Erforschung eines Heilmittels.';
            winGroupImg.src = `img/virus-game/citizen.png`;
            winConditionImg.src = `img/virus-game/cure.png`;
        } else if (condition == 'kill') {
            winMessage.innerHTML = 'Die Bürger gewinnen durch die erfolgreiche Auslöschung der Terroristen.';
            winGroupImg.src = `img/virus-game/citizen.png`;
            winConditionImg.src = `img/virus-game/kill.png`;
        } else {
            winMessage.innerHTML = 'Die Terroristen gewinnen.';
            winGroupImg.src = `img/virus-game/terrorist.png`;
        }

        winGroupImg.style.transform = 'translateX(calc(50% + 32px))';
        winConditionImg.style.transform = 'translateX(calc(-50% - 32px))';
    }, 1000);

    switchToSection('virus-game-win');

    setTimeout(() => {
        winGroupImg.style.opacity = 1;
    }, 3100);
    setTimeout(() => {
        winMessage.style.opacity = 1;
        if (condition != 'terrorist') {
            winGroupImg.style.transform = 'translateX(0%)';
            winConditionImg.style.opacity = 1;
            winConditionImg.style.transform = 'translateX(0%)';
        }
    }, 5100);
});


// Memory Game

const questionsMemoryGame = [];
var questionCountMemoryGame = 0;
var isHiddenMemoryGame = true;

// Update list of questions
socket.on('memory-game-questions-from-server', (receivedList) => {
    receivedList.forEach((q) => {
        questionsMemoryGame.push(q);
    });
});

// Show questions-section
socket.on('memory-game-display-questions', () => {
    const question = document.getElementById('memory-game-question');
    const svg = document.getElementById('memory-game-svg');

    question.style.opacity = 0;
    svg.style.opacity = 0;

    switchToSection('memory-game');
    setTimeout(() => {
        question.style.opacity = 1;
        svg.style.opacity = 1;
    }, 2000);
});

// Show next question
socket.on('memory-game-next-question', () => {
    const question = document.getElementById('memory-game-question');

    questionCountMemoryGame += 1;
    if (questionCountMemoryGame < questionsMemoryGame.length) {
        if (isHiddenMemoryGame == false) {
            stopTimerMemoryGame();
            question.style.opacity = 0;
            setTimeout(() => {
                question.innerHTML = questionsMemoryGame[questionCountMemoryGame].question;
                question.style.opacity = 1;
                runTimerMemoryGame(questionsMemoryGame[questionCountMemoryGame].delay);
            }, 1000);
        }
    } else {
        questionCountMemoryGame = questionsMemoryGame.length - 1;
    }
});

// Show previous question
socket.on('memory-game-previous-question', () => {
    const question = document.getElementById('memory-game-question');

    questionCountMemoryGame -= 1;
    if (questionCountMemoryGame >= 0) {
        if (isHiddenMemoryGame == false) {
            stopTimerMemoryGame();
            question.style.opacity = 0;
            setTimeout(() => {
                question.innerHTML = questionsMemoryGame[questionCountMemoryGame].question;
                question.style.opacity = 1;
                runTimerMemoryGame(questionsMemoryGame[questionCountMemoryGame].delay);
            }, 1000);
        }
    } else {
        questionCountMemoryGame = 0;
    }
});

// Show question
socket.on('memory-game-show-question', () => {
    if (isHiddenMemoryGame) {
        const question = document.getElementById('memory-game-question');

        isHiddenMemoryGame = false;
        question.style.opacity = 0;
        setTimeout(() => {
            question.innerHTML = questionsMemoryGame[questionCountMemoryGame].question;
            question.style.opacity = 1;
        }, 1000);
        runTimerMemoryGame(questionsMemoryGame[questionCountMemoryGame].delay);
    }
});

// Hide question
socket.on('memory-game-hide-question', () => {
    if (isHiddenMemoryGame == false) {
        const question = document.getElementById('memory-game-question');

        isHiddenMemoryGame = true;
        question.style.opacity = 0;
        setTimeout(() => {
            question.innerHTML = '&#10022; &#10022; &#10022;';
            question.style.opacity = 1;
        }, 1000);
        stopTimerMemoryGame();
    }
});

// Run circle timer animation
function runTimerMemoryGame(delay = 0) {
    const circle = document.getElementById('memory-game-timer');
    setTimeout(() => {
        circle.classList.add('animation');
    }, delay + 1000);
}

// Stop circle timer animation
function stopTimerMemoryGame() {
    const circle = document.getElementById('memory-game-timer');
    const svg = document.getElementById('memory-game-svg');

    svg.style.opacity = 0;
    setTimeout(() => {
        circle.classList.remove('animation');
        circle.style.strokeDashoffset = '0px';
        svg.style.opacity = 1;
    }, 1000);
}
