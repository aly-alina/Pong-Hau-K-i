/* -------- GLOBAL VARIABLES -------- */

var gameIsOn = false;
var readmeIsOn = false;
var stopMessageOn = false;
var readmeBox = document.getElementById("readme");
var gameBoardBox = document.getElementById("gameBoard");
var stopBox = document.getElementById("stop");
var currentTokensPositions = {
    'topLeftVertex': "",
    'topRightVertex': "",
    'middleVertex': "",
    'bottomLeftVertex': "",
    'bottomRightVertex': ""
};
var initialVerticesPlayer1 = ["topLeftVertex", "topRightVertex"];
var initialVerticesPlayer2 = ["bottomLeftVertex", "bottomRightVertex"];
var tokens = {
    "player1": ["tokenPlayer1", "token2Player1"],
    "player2": ["tokenPlayer2", "token2Player2"]
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
    if (currentTokensPositions.hasOwnProperty(parentId)) {
        currentTokensPositions[parentId] = ""; // token leaves the vertex
    }
    e.dataTransfer.setData("Text", e.target.id);
}

function drop(e) {
    e.preventDefault();
    var data = e.dataTransfer.getData("Text");
    var targetVertex = e.target;

    // prevent to add several token in the middle vertex
    var currentChildrenOfVertex = targetVertex.childNodes;
    for (var i = 0; i < currentChildrenOfVertex.length; i++) {
        if (currentChildrenOfVertex[i].nodeName == "IMG") {
            return;
        }
    }

    // prevent dragging several images in one vertex (for the rest of currentTokensPositions)
    if (targetVertex.nodeName !== "IMG") {
        targetVertex.appendChild(document.getElementById(data));
        currentTokensPositions[targetVertex.id] = data; // token in this vertex now
    }
}

/* -------- CONTROL ------------ */

var reset = function() {
    initTokensOfAPlayer(initialVerticesPlayer1, tokens.player1);
    initTokensOfAPlayer(initialVerticesPlayer2, tokens.player2);
};

var turnOffReadme = function() {
    readmeIsOn = false;
    readmeBox.style.display = "none";
};

var turnOffStopMessage = function() {
    stopMessageOn = false;
    stopBox.style.display = "none";
};

/* ------------- COMMON FUNCTIONS -------- */

var initTokensOfAPlayer = function (initVertices, playerTokens) {
    for (var i = 0; i < initVertices.length; i++) {
        // move token to initial position
        document.getElementById(initVertices[i])
            .appendChild(document.getElementById(playerTokens[i]));
        currentTokensPositions[initVertices[i]] = playerTokens[i];
    }
};