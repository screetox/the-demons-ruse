const outputField = document.getElementById('output');
const numberInput = document.getElementById('number-input');
const outputumbers = document.getElementById('output-numbers');
const choosePersons = document.getElementById('choose-persons');
const specifyNumbers = document.getElementById('specify-numbers');
const makeCalculations = document.getElementById('make-calculations');
const inputPlayercount = document.getElementById('input-playercount');
const nonspecifyNumbers = document.getElementById('nonspecify-numbers');
const specifyPlayercount = document.getElementById('specify-playercount');

const numbersAndNames = []

function savePlayercount() {
    numberInput.innerHTML = '';
    const count = inputPlayercount.value;
    for (i = 0; i < count; i++) {
        numberInput.innerHTML += `
        <div>
            <input id="input-name${i}" placeholder="Name ${i + 1}">
            <input id="input-number${i}" class="w32 text-center" placeholder="# ${i + 1}">
        </div>
        `;
    }
    specifyPlayercount.style.display = 'none';
    specifyNumbers.style.display = 'flex';
}

function saveNumbers() {
    const nameInputs = document.querySelectorAll(`[id^='input-name']`);
    const numberInputs = document.querySelectorAll(`[id^='input-number']`);
    numbersAndNames.length = 0;
    for (let i = 0; i < numberInputs.length; i++) {
        numbersAndNames.push({name: nameInputs[i].value, number: numberInputs[i].value});
    }

    let personSelection = `
    <div class="flex column g16" style="margin-bottom: 16px;">
        <h3 class="m16">Erste Person:</h3>
        <div class="flex g16">
    `;
    for (let i = numbersAndNames.length - (numbersAndNames.length % 3 == 0 ? 3 : numbersAndNames.length % 3); i >= 0; i=i-3) {
        personSelection += `
        <div class="flex column g16">
            <input type="radio" id="first-${i}" class="player-radio-button" name="first" value="${numbersAndNames[i].number}"${i == 0 ? ' checked' : ''}>
            <label for="first-${i}" class="player-radio-button-label" style="background-image: url('/img/playerimgs/${numbersAndNames[i].name.toLowerCase()}.jpg')"></label>
            ${i+1 < numbersAndNames.length ? `<input type="radio" class="player-radio-button" id="first-${i+1}" name="first" value="${numbersAndNames[i+1].number}">
            <label for="first-${i+1}" class="player-radio-button-label" style="background-image: url('/img/playerimgs/${numbersAndNames[i+1].name.toLowerCase()}.jpg')"></label>` : ''}
            ${i+2 < numbersAndNames.length ? `<input type="radio" class="player-radio-button" id="first-${i+2}" name="first" value="${numbersAndNames[i+2].number}">
            <label for="first-${i+2}" class="player-radio-button-label" style="background-image: url('/img/playerimgs/${numbersAndNames[i+2].name.toLowerCase()}.jpg')"></label>` : ''}
        </div>
        `;
    }
    personSelection += `
        </div>
    </div>
    <div class="vr"></div>
    <div class="flex column g16" style="margin-bottom: 16px;">
        <h3 class="m16">Zweite Person:</h3>
        <div class="flex g16">
    `;
    for (let i = 0; i < numbersAndNames.length; i=i+3) {
        personSelection += `
        <div class="flex column g16">
            <input type="radio" id="second-${i}" class="player-radio-button" name="second" value="${numbersAndNames[i].number}"${i == 0 ? ' checked' : ''}>
            <label for="second-${i}" class="player-radio-button-label" style="background-image: url('/img/playerimgs/${numbersAndNames[i].name.toLowerCase()}.jpg')"></label>
            ${i+1 < numbersAndNames.length ? `<input type="radio" id="second-${i+1}" class="player-radio-button" name="second" value="${numbersAndNames[i+1].number}">
            <label for="second-${i+1}" class="player-radio-button-label" style="background-image: url('/img/playerimgs/${numbersAndNames[i+1].name.toLowerCase()}.jpg')"></label>` : ''}
            ${i+2 < numbersAndNames.length ? `<input type="radio" id="second-${i+2}" class="player-radio-button" name="second" value="${numbersAndNames[i+2].number}">
            <label for="second-${i+2}" class="player-radio-button-label" style="background-image: url('/img/playerimgs/${numbersAndNames[i+2].name.toLowerCase()}.jpg')"></label>` : ''}
        </div>
        `;
    }
    personSelection += `
        </div>
    </div>
    `;

    choosePersons.innerHTML += personSelection;

    for (let i = 0; i < numbersAndNames.length; i++) {
        outputumbers.innerHTML += `
            <h3>${numbersAndNames[i].name}: ${numbersAndNames[i].number}</h3><br>
        `;
    }

    specifyNumbers.style.display = 'none';
    makeCalculations.style.display = 'flex';
}

function calculate(operation) {
    const firstNumber = document.querySelector('input[name="first"]:checked').value;
    const secondNumber = document.querySelector('input[name="second"]:checked').value;

    let result = '';
    switch (operation) {
        case '+':
            let sum = (firstNumber*1) + (secondNumber*1);
            if (sum < 21) {
                result = '3 - 20';
            } else if (sum > 179) {
                result = '180 - 199';
            } else {
                result = `${sum}`;
            }
            break;
        case '*':
            let lastDigitOfProduct = ((firstNumber*1) * (secondNumber)*1) % 10;
            result = `${lastDigitOfProduct}`;
            break;
        case '/':
            let toQuotient = (firstNumber*1) > (secondNumber*1) ? {higherNr: (firstNumber*1), lowerNr: (secondNumber*1)} : {higherNr: (secondNumber*1), lowerNr: (firstNumber*1)};
            let quotientWithoutRest = Math.trunc(toQuotient.higherNr / toQuotient.lowerNr);
            result = `${quotientWithoutRest}`;
            break;
        case '0':
            let toZero = (firstNumber*1) > (secondNumber*1) ? {higherNr: (firstNumber*1), lowerNr: (secondNumber*1)} : {higherNr: (secondNumber*1), lowerNr: (firstNumber*1)};
            let numbersOfZero = Math.trunc(toZero.higherNr / 10) - Math.trunc(toZero.lowerNr / 10);
            if (toZero.higherNr % 10 == 0) {
                numbersOfZero -= 1;
            }
            result = `${numbersOfZero}`;
            break;
        default:
            result = 'Fehler';
            break;
    }

    outputField.innerHTML = result;
    setTimeout(clearOuput, 5000);
}

function clearOuput() {
    outputField.innerHTML = '&#10022;';
}

function showNumbers() {
    makeCalculations.style.display = 'none';
    nonspecifyNumbers.style.display = 'flex';
}

function showCalculations() {
    nonspecifyNumbers.style.display = 'none';
    makeCalculations.style.display = 'flex';
}
