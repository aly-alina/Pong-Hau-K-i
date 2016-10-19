/* -------- GLOBAL VARIABLES -------- */

var gameIsOn = false;
var readmeIsOn = false;
var stopMessageOn = false;
var readmeBox = document.getElementById("readme");
var gameBoardBox = document.getElementById("gameBoard");
var stopBox = document.getElementById("stop");
var vertices = {
    'topLeftVertex': "",
    'topRightVertex': "",
    'middleVertex': "",
    'bottomLeftVertex': "",
    'bottomRightVertex': ""
};

/* -------- EVENT HANDLERS ---------- */

var startGame = function(e) {
    if (!gameIsOn) {
        if (readmeIsOn) {
            turnOffReadme();
        }
        if (stopMessageOn) {
            turnOffStopMessage();
        }
        gameIsOn = true;
        gameBoardBox.style.display = "block";
    }
};

var stopGame = function(e) {
    if (gameIsOn) {
        gameIsOn = false;
        gameBoardBox.style.display = "none";
        stopBox.style.display = "block";
        stopMessageOn = true;
    }
};

var showReadme = function (e) {
    if (!gameIsOn && !readmeIsOn) {
        if (stopMessageOn) {
            turnOffStopMessage();
        }
        readmeIsOn = true;
        readmeBox.style.display = "block";
    }
};

function allowDrop(e) {
    e.preventDefault();
}

function drag(e) {
    e.dataTransfer.setData("Text", e.target.id);
}

function drop(e) {
    e.preventDefault();
    var data = e.dataTransfer.getData("Text");
    var element = e.target;
    if (element.nodeName !== "IMG") { // prevent dragging all images in one box
        element.appendChild(document.getElementById(data));
        vertices[element.id] = data;
    }
}

/* -------- CONTROL ------------ */

var turnOffReadme = function() {
    readmeIsOn = false;
    readmeBox.style.display = "none";
};

var turnOffStopMessage = function() {
    stopMessageOn = false;
    stopBox.style.display = "none";
};