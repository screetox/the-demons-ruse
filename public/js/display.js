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
socket.on('play-video', ({videoPath, videoLength}) => {
    const videoTag = document.getElementById('video-display');

    setTimeout(() => {
        videoTag.src = `vid/${videoPath}`;
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

// Play video in fullscreen
socket.on('show-image', (imageName) => {
    const imageTag = document.getElementById('img-display');

    setTimeout(() => {
        imageTag.src = `img/${imageName}`;
        imageTag.load();
    }, 1000);
    switchToSection('image');
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
    const questionNr = document.getElementById('memory-game-question-nr');

    questionCountMemoryGame += 1;
    if (questionCountMemoryGame < questionsMemoryGame.length) {
        questionNr.style.opacity = 0;
        setTimeout(() => {
            questionNr.innerHTML = `${questionCountMemoryGame + 1}`;
            questionNr.style.opacity = 1;
        }, 1000);
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
    const questionNr = document.getElementById('memory-game-question-nr');

    questionCountMemoryGame -= 1;
    if (questionCountMemoryGame >= 0) {
        questionNr.style.opacity = 0;
        setTimeout(() => {
            questionNr.innerHTML = `${questionCountMemoryGame + 1}`;
            questionNr.style.opacity = 1;
        }, 1000);
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


// Rules Game

// Show rules-section
socket.on('rules-game-display', () => {
    switchToSection('rules-game');
});

// Show rules-section
socket.on('rules-game-clear-rule', () => {
    const ruleGroup1 = document.querySelectorAll('#rule-group-1 div.rule-block');
    const ruleGroup2 = document.querySelectorAll('#rule-group-2 div.rule-block');
    const ruleGroup3 = document.querySelectorAll('#rule-group-3 div.rule-block');

    const allGroups = [];
    ruleGroup1.forEach((r1) => {
        allGroups.push(r1);
    });
    ruleGroup2.forEach((r2) => {
        allGroups.push(r2);
    });
    ruleGroup3.forEach((r3) => {
        allGroups.push(r3);
    });
    for (i = 0; i < allGroups.length; i++) {
        allGroups[i].classList.remove('not-active');
        allGroups[i].style.transform = `translateY(0px)`;
    }
});

// Update group rule
socket.on('change-group-rule-rules-game', ({r1, r2, r3}) => {
    const ruleGroup1 = document.querySelectorAll('#rule-group-1 div.rule-block');
    const ruleGroup2 = document.querySelectorAll('#rule-group-2 div.rule-block');
    const ruleGroup3 = document.querySelectorAll('#rule-group-3 div.rule-block');

    moveRuleToTopRulesGame(ruleGroup1, r1);
    moveRuleToTopRulesGame(ruleGroup2, r2);
    moveRuleToTopRulesGame(ruleGroup3, r3);
});

// Move specific group rule to top
function moveRuleToTopRulesGame(ruleGroup, rule) {
    let counter = 1;
    let ruleFound = false;
    for (i = 0; i < ruleGroup.length; i++) {
        if (ruleGroup[i].id == rule) {
            ruleGroup[i].classList.remove('not-active');
            ruleGroup[i].style.transform = `translateY(-${(counter * 84) - 42}px)`;
            ruleFound = true;
        } else {
            ruleGroup[i].classList.add('not-active');
            counter += 1;
            if (ruleFound) {
                ruleGroup[i].style.transform = `translateY(0px)`;
            } else {
                ruleGroup[i].style.transform = `translateY(84px)`;
            }
        }
    }
}


// Mimic Game

var pauseMimicGame = false;
var nextParamsMimicGame = ['path', 'idx', 'lastIndex'];

// Show mimic-section
socket.on('mimic-game-display', () => {
    switchToSection('mimic-game');
});

// Play round {1, 2, 3} of the mimic game
socket.on('mimic-game-run-round', ({rnd, lastIndex}) => {
    const imgTag = document.getElementById('mimic-game-img');
    const roundNr = document.getElementById('mimic-game-round-nr');
    const folderPath = `img/mimic-game/round${rnd}`;

    pauseMimicGame = false;
    imgTag.src = '';
    if (roundNr.innerHTML != `${rnd}`) {
        roundNr.style.opacity = 0;
    }
    setTimeout(() => {
        roundNr.innerHTML = `${rnd}`;
        roundNr.style.opacity = 1;
        imgTag.style.opacity = 1;
        setTimeout(() => {
            imgTag.src = 'img/mimic-game/3.jpg';
            setTimeout(() => {
                imgTag.src = 'img/mimic-game/2.jpg';
                setTimeout(() => {
                    imgTag.src = 'img/mimic-game/1.jpg';
                    setTimeout(() => {
                        loopImagesMimicGame(folderPath, 0, lastIndex);
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 2000);
    }, 1000);
});

// Display specific image from folder
function loopImagesMimicGame(path, idx, lastIndex) {
    const imgTag = document.getElementById('mimic-game-img');

    if (idx <= lastIndex) {
        if (pauseMimicGame) {
            nextParamsMimicGame = [path, idx, lastIndex];
        } else {
            imgTag.src = `${path}/${idx}.jpg`;
            setTimeout(() => {
                idx = parseInt(idx) + 1;
                loopImagesMimicGame(path, idx, lastIndex);
            }, 3000);
        }
    } else {
        imgTag.style.opacity = 0;
    }
}

// Pause the game
socket.on('mimic-game-pause', () => {
    const imgTag = document.getElementById('mimic-game-img');

    pauseMimicGame = true;
    imgTag.style.filter = 'grayscale(1)';
});

// Resume the game
socket.on('mimic-game-resume', () => {
    const imgTag = document.getElementById('mimic-game-img');

    pauseMimicGame = false;
    imgTag.style.filter = 'grayscale(0)';
    setTimeout(() => {
        loopImagesMimicGame(nextParamsMimicGame[0], nextParamsMimicGame[1], nextParamsMimicGame[2]);
    }, 3000);
});

// Pause the game
socket.on('mimic-game-break', () => {
    const imgTag = document.getElementById('mimic-game-img');

    pauseMimicGame = true;
    imgTag.style.opacity = 0;
});


// Hexagon Game

// TODO: change numbers
const hexagonNumbers = [
    [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
    [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,1],
    [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,1,2],
    [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,1,2,3],
    [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,1,2,3,4],
    [6,7,8,9,10,11,12,13,14,15,16,17,18,19,1,2,3,4,5],
    [7,8,9,10,11,12,13,14,15,16,17,18,19,1,2,3,4,5,6],
    [8,9,10,11,12,13,14,15,16,17,18,19,1,2,3,4,5,6,7],
    [9,10,11,12,13,14,15,16,17,18,19,1,2,3,4,5,6,7,8],
    [10,11,12,13,14,15,16,17,18,19,1,2,3,4,5,6,7,8,9]
];
// TODO: change numbers
const targetNumbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];
const hexagonLetters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S'];

// Show hexagon-section
socket.on('hexagon-game-display', () => {
    switchToSection('hexagon-game');
});

// Show numbers
socket.on('hexagon-show-numbers', (rnd) => {
    const targetNr = document.getElementById('hexagon-target-nr');
    targetNr.innerHTML = 'X';

    setTimeout(() => {
        changeToNumbersHexagonGame(rnd, 0);
    }, 500);
    setTimeout(() => {
        setTimeout(() => {
            changeToLettersHexagonGame(0);
        }, 500);
    }, 30000);
});

// Change numbers with delay in between
function changeToNumbersHexagonGame(rnd, idx) {
    if (idx < 19) {
        const hex = document.getElementById(`hexagon-${idx}`);
        const hexShape = document.getElementById(`hexagon-shape-${idx}`);

        hex.innerHTML = hexagonNumbers[rnd][idx];
        hex.style.color = '#000';
        hexShape.style.backgroundColor = '#fff';
        idx = parseInt(idx) + 1;
        setTimeout(() => {
            changeToNumbersHexagonGame(rnd, idx);
        }, 10);
    }
}

// Change letters with delay in between
function changeToLettersHexagonGame(idx) {
    if (idx < 19) {
        const hex = document.getElementById(`hexagon-${idx}`);
        const hexShape = document.getElementById(`hexagon-shape-${idx}`);

        hex.innerHTML = hexagonLetters[idx];
        hex.style.color = '#fff';
        hexShape.style.backgroundColor = '#000';
        idx = parseInt(idx) + 1;
        setTimeout(() => {
            changeToLettersHexagonGame(idx);
        }, 10);
    }
}

// Show target
socket.on('hexagon-show-target', (trgt) => {
    const targetNr = document.getElementById('hexagon-target-nr');
    targetNr.innerHTML = targetNumbers[trgt];
});

// Hide target
socket.on('hexagon-hide-target', () => {
    const targetNr = document.getElementById('hexagon-target-nr');
    targetNr.innerHTML = 'X';
});
