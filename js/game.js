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
var tokens = ["tokenPlayer1", "token2Player1", "tokenPlayer2", "token2Player2"];

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
        reset();
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
    var parentId = e.target.parentElement.id;
    if (vertices.hasOwnProperty(parentId)) {
        vertices[parentId] = ""; // token leaves the vertex
    }
    e.dataTransfer.setData("Text", e.target.id);
}

function drop(e) {
    e.preventDefault();
    var data = e.dataTransfer.getData("Text");
    var element = e.target;

    // prevent to add several token in the middle vertex
    var currentChildren = element.childNodes;
    for (var i = 0; i < currentChildren.length; i++) {
        if (currentChildren[i].nodeName == "IMG") {
            return;
        }
    }

    if (element.nodeName !== "IMG") { // prevent dragging several images in one vertex (for the rest of vertices)
        element.appendChild(document.getElementById(data));
        vertices[element.id] = data; // token in this vertex now
    }
}

/* -------- CONTROL ------------ */

var reset = function() {
    var initImagesBox = document.getElementById("initImages");
    for (var i in tokens) {
        initImagesBox.appendChild(document.getElementById(tokens[i])); // return tokens to be below the gameboard
    }
    for (var property in vertices) {
        if (vertices.hasOwnProperty(property)) {
            vertices[property] = ""; // clean vertices object
        }
    }
};

var turnOffReadme = function() {
    readmeIsOn = false;
    readmeBox.style.display = "none";
};

var turnOffStopMessage = function() {
    stopMessageOn = false;
    stopBox.style.display = "none";
};