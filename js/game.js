/* -------- GLOBAL VARIABLES -------- */

var gameIsOn = false;
var readmeIsOn = false;
var readmeBox = document.getElementById("readme");
var gameBoardBox = document.getElementById("gameBoard");

/* -------- EVENT HANDLERS ---------- */

var startGame = function(e) {
    if (!gameIsOn) {
        if (readmeIsOn) {
            turnOffReadme();
        }
        gameIsOn = true;
        gameBoardBox.style.display = "block";
    }
};

var stopGame = function(e) {
    if (gameIsOn) {
        gameIsOn = false;
        gameBoardBox.style.display = "none";
    }
};

var showReadme = function (e) {
    if (!gameIsOn && !readmeIsOn) {
        readmeIsOn = true;
        readmeBox.style.display = "block";
    }
};

/* -------- CONTROL ------------ */

var turnOffReadme = function() {
    readmeIsOn = false;
    readmeBox.style.display = "none";
};