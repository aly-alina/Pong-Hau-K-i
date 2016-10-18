/* -------- GLOBAL VARIABLES -------- */

var gameIsOn = false;
var readmeIsOn = false;
var readmeBox = document.getElementById("readme");

/* -------- EVENT HANDLERS ---------- */

var startGame = function(e) {
    turnOffReadme();
    gameIsOn = true;
};

var stopGame = function(e) {
    turnOffReadme();
    gameIsOn = false;
};

var showReadme = function (e) {
    readmeIsOn = true;
    readmeBox.style.display = "block";
};

/* -------- CONTROL ------------ */

var turnOffReadme = function() {
    if (readmeIsOn) {
        readmeIsOn = false;
        readmeBox.style.display = "none";
    }
};