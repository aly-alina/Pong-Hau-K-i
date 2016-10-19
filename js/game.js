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
var player1Turn = false;
var player2Turn = false;
var boxForCurrentPlayerDisplay = document.getElementById("whosTurn");
var player1Name = "Player 1";
var playerOneColor = "#9ab7f3";
var player2Name = "Player 2";
var playerTwoColor = "#1abc9c";

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
        startPlayer1Turn();
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
        if (player1Turn) {
            stopPlayer1Turn();
        } else if (player2Turn) {
            stopPlayer2Turn();
        }
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

var startPlayer1Turn = function() {
    player2Turn = false;
    player1Turn = true;
    displayTextWhosTurn(player1Name, playerOneColor);
    changeDraggableAttribute(tokens.player1, true);
    changeDraggableAttribute(tokens.player2, false);
};

var startPlayer2Turn = function() {
    player1Turn = false;
    player2Turn = true;
    displayTextWhosTurn(player2Name, playerTwoColor);
    changeDraggableAttribute(tokens.player2, true);
    changeDraggableAttribute(tokens.player1, false);
};

var stopPlayer1Turn = function() {
    player1Turn = false;
    startPlayer2Turn();
};

var stopPlayer2Turn = function() {
    player2Turn = false;
    startPlayer1Turn();
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

var displayTextWhosTurn = function(nameOfPlayer, playerColor) {
    boxForCurrentPlayerDisplay.innerHTML = nameOfPlayer + " turn";
    boxForCurrentPlayerDisplay.style.color = playerColor;
};

var changeDraggableAttribute = function(thisPlayerTokens, boolValue) {
    for (var i = 0; i < thisPlayerTokens.length; i++) {
        document.getElementById(thisPlayerTokens[i]).setAttribute("draggable", boolValue);
    }
};