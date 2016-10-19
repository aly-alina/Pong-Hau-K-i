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
var vertexLeftEmpty = "";
var adjacentVertices = {
    'topLeftVertex': ['middleVertex', 'bottomLeftVertex'],
    'topRightVertex': ['middleVertex', 'bottomRightVertex'],
    'middleVertex': ['topLeftVertex', 'topRightVertex', 'bottomLeftVertex', 'bottomRightVertex'],
    'bottomLeftVertex': ['topLeftVertex', 'middleVertex', 'bottomRightVertex'],
    'bottomRightVertex': ['topRightVertex', 'middleVertex', 'bottomLeftVertex']
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
        startPlayer1Turn();
    }
};

var stopGame = function(e) {
    stop();
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

var allowDrop = function(e) {
    e.preventDefault();
};

var drag = function(e) {
    var parentId = e.target.parentElement.id;
    if (currentTokensPositions.hasOwnProperty(parentId)) {
        currentTokensPositions[parentId] = ""; // token leaves the vertex
        vertexLeftEmpty = parentId;
    }
    e.dataTransfer.setData("Text", e.target.id);
};

var drop = function(e) {
    e.preventDefault();
    var data = e.dataTransfer.getData("Text");
    var targetVertex = e.target;

    if(checkIfOccupiedOrNotAdjacent(targetVertex)) { // prevent dragging to occupied or not adjacent vertex
        return;
    }

    targetVertex.appendChild(document.getElementById(data));
    currentTokensPositions[targetVertex.id] = data; // token in this vertex now
    if (player1Turn) {
        stopPlayer1Turn();
    } else if (player2Turn) {
        stopPlayer2Turn();
    }
};

/* -------- CONTROL ------------ */

var reset = function() {
    vertexLeftEmpty = "";
    emptyVertices();
    player1Turn = false;
    player2Turn = false;
    initTokensOfAPlayer(initialVerticesPlayer1, tokens.player1);
    initTokensOfAPlayer(initialVerticesPlayer2, tokens.player2);
};

var stop = function() {
    if (gameIsOn) {
        gameIsOn = false;
        gameBoardBox.style.display = "none";
        stopBox.style.display = "block";
        stopMessageOn = true;
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

var startPlayer1Turn = function() {
    player2Turn = false;
    player1Turn = true;
    if (checkIfLose("player1")) {
        stop();
    }
    displayTextWhosTurn(player1Name, playerOneColor);
    changeDraggableAttribute(tokens.player1, true);
    changeDraggableAttribute(tokens.player2, false);
};

var startPlayer2Turn = function() {
    player1Turn = false;
    player2Turn = true;
    if (checkIfLose("player2")) {
        stop();
    }
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

/* ------------- OTHER FUNCTIONS -------- */

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

var emptyVertices = function() {
    for (var property in currentTokensPositions) {
        if (currentTokensPositions.hasOwnProperty(property)) {
            currentTokensPositions[property] = "";
        }
    }
};

var checkIfLose = function(player) {
    if (tokens.hasOwnProperty(player)) {
        var playersTokens = tokens[player];
        for (var i = 0; i < playersTokens.length; i++) {
            var thisTokenId = playersTokens[i];
            var tokenPosition = findWhereIsToken(thisTokenId);
            if (!checkIfAdjacentAreOccupied(tokenPosition)) { // at least one adjacent vertex is free
                return false;
            }
        }
        return true;
    }
};

var findWhereIsToken = function(tokenId) {
    for (var vertex in currentTokensPositions) {
        if (currentTokensPositions[vertex] == tokenId) {
            return vertex;
        }
    }
    return "-1";
};

var checkIfAdjacentAreOccupied = function(vertex) {
    if (adjacentVertices.hasOwnProperty(vertex)) {
        var adjacent = adjacentVertices[vertex];
        for (var i = 0; i < adjacent.length; i++) {
            var vertexElement = document.getElementById(adjacent[i]);
            if (!checkIfOccupied(vertexElement)) {
                return false;
            }
        }
        return true;
    }
};

var checkIfOccupiedOrNotAdjacent = function(targetVertex) {
    return checkIfOccupied(targetVertex) || !isAdjacent(vertexLeftEmpty, targetVertex);
};

var checkIfOccupied = function(targetVertex) {
    if ( checkIfOccupiedWithChildren(targetVertex.id) || targetVertex.nodeName == "IMG") {
        return true;
    } else {
        return false;
    }
};

var checkIfOccupiedWithChildren = function(vertexId) {
    var currentChildrenOfVertex = document.getElementById(vertexId).childNodes;
    for (var i = 0; i < currentChildrenOfVertex.length; i++) {
        if (currentChildrenOfVertex[i].nodeName == "IMG") {
            return true;
        }
    }
    return false;
};

var isAdjacent = function(vertex1, vertex2) {
    if (adjacentVertices.hasOwnProperty(vertex1)) {
        var thisAdjacentVertices = adjacentVertices[vertex1];
        for (var i = 0; i < thisAdjacentVertices.length; i++) {
            if (thisAdjacentVertices[i] == vertex2.id) {
                return true;
            }
        }
    }
    return false;
};