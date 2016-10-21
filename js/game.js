/* -------- GLOBAL VARIABLES -------- */

var gameIsOn = false;
var readmeIsOn = false;
var stopMessageOn = false;
var readmeBox = document.getElementById("readme");
var gameBoardBox = document.getElementById("gameBoard");
var stopBox = document.getElementById("stop");
var currentTokensPositions = { // keeps which token is inside which vertex (vertexId -> tokenId)
    'topLeftVertex': "",
    'topRightVertex': "",
    'middleVertex': "",
    'bottomLeftVertex': "",
    'bottomRightVertex': ""
};
var initialVerticesPlayer1 = ["topLeftVertex", "topRightVertex"];
var initialVerticesPlayer2 = ["bottomLeftVertex", "bottomRightVertex"];
var players = {
    "player1": {
        "name": "Your",
        "color": "#9ab7f3",
        "turn": false,
        "tokens": ["tokenPlayer1", "token2Player1"]
    },
    "player2": {
        "name": "Computer",
        "color": "#1abc9c",
        "turn": false,
        "tokens": ["tokenPlayer2", "token2Player2"]
    }
};
var boxForCurrentPlayerDisplay = document.getElementById("whosTurn");
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
    stop("The game was stopped", "black");
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

    // prevent dragging to occupied or not adjacent vertex
    if(checkIfOccupied(targetVertex) || !isAdjacent(vertexLeftEmpty, targetVertex.id)) {
        return;
    }

    targetVertex.appendChild(document.getElementById(data));
    currentTokensPositions[targetVertex.id] = data; // token in this vertex now
    stopCurrentPlayerTurn();
};

/* -------- CONTROL ------------ */

var reset = function() {
    vertexLeftEmpty = "";
    emptyVertices();
    players['player1'].turn = false;
    players['player2'].turn = false;
    initTokensOfAPlayer(initialVerticesPlayer1, players['player1'].tokens);
    initTokensOfAPlayer(initialVerticesPlayer2, players['player2'].tokens);
};

var stop = function(text, color) {
    if (gameIsOn) {
        gameIsOn = false;
        gameBoardBox.style.display = "none";
        stopBox.style.display = "block";
        stopBox.innerHTML = text;
        stopBox.style.color = color;
        stopMessageOn = true;
    }
};

var lose = function(playersPropertyName) {
    stop(players[playersPropertyName].name + " loss", players[playersPropertyName].color);
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
    players['player2'].turn = false;
    players['player1'].turn = true;
    if (checkIfLose("player1")) {
        // stop();
        lose("player1");
        return;
    }
    displayTextWhosTurn(players['player1'].name, players['player1'].color);
    changeDraggableAttribute(players['player1'].tokens, true);
    changeDraggableAttribute(players['player2'].tokens, false);
};

// Computer
var startPlayer2Turn = function() {
    players['player1'].turn = false;
    players['player2'].turn = true;
    if (checkIfLose("player2")) {
        // stop();
        lose("player2");
        return;
    }
    displayTextWhosTurn(players['player2'].name, players['player2'].color);
    changeDraggableAttribute(players['player2'].tokens, true);
    changeDraggableAttribute(players['player1'].tokens, false);
    commenceMoveWithComputer('player2');
};

var stopPlayer1Turn = function() {
    players['player1'].turn = false;
    startPlayer2Turn();
};

var stopPlayer2Turn = function() {
    players['player2'].turn = false;
    startPlayer1Turn();
};

var stopCurrentPlayerTurn = function() {
    if (players['player1'].turn) {
        stopPlayer1Turn();
    } else if (players['player2'].turn) {
        stopPlayer2Turn();
    }
};

var commenceMoveWithComputer = function(playersPropertyName) {
    if (players.hasOwnProperty(playersPropertyName)) {
        // 1. find where my tokens
        var computersTokensPositionsIds = [];
        var tokensIds = players[playersPropertyName].tokens;
        for (var i = 0; i < tokensIds.length; i++) {
            computersTokensPositionsIds[i] = findWhereIsToken(tokensIds[i]);
        }
        // 2. find token with first adjacent free vertex
        var vertexToMoveFrom = computersTokensPositionsIds[0];
        var tokenToMove = tokensIds[0];
        var freeVertexId = findFreeAdjacentVertex(vertexToMoveFrom);
        if (!freeVertexId) {
            vertexToMoveFrom = computersTokensPositionsIds[1];
            tokenToMove = tokensIds[1];
            freeVertexId = findFreeAdjacentVertex(vertexToMoveFrom);
        }
        // 3. move the token to that vertex
        moveToken(tokenToMove, vertexToMoveFrom, freeVertexId);
        // 4. give turn to another player
        stopCurrentPlayerTurn();
    }
};

/* ------------- OTHER FUNCTIONS -------- */

/**
 * Moves tokens of a player i into the initial vertices so, resets tokens' positions
 * @param initVerticesIds - array with vertices ids: which vertices put tokens in
 * @param playerTokensIds - array with ids of tokens of this player
 */
var initTokensOfAPlayer = function (initVerticesIds, playerTokensIds) {
    for (var i = 0; i < initVerticesIds.length; i++) {
        moveToken(playerTokensIds[i], "", initVerticesIds[i]);
    }
};

/**
 * Moves the token to the specified vertex
 * @param tokenId - token to move
 * @param previousVertexId - previous position of that token
 * @param vertexIdToMoveTo - where to move the token
 */
var moveToken = function(tokenId, previousVertexId, vertexIdToMoveTo) {
    document.getElementById(vertexIdToMoveTo)
        .appendChild(document.getElementById(tokenId));
    if (currentTokensPositions.hasOwnProperty(vertexIdToMoveTo)) {
        currentTokensPositions[vertexIdToMoveTo] = tokenId;
    }
    if (currentTokensPositions.hasOwnProperty(previousVertexId)) {
        currentTokensPositions[previousVertexId] = "";
    }
};

/**
 * Displays below the gameboard who's turn is now
 * @param nameOfPlayer - string, name of the current player
 * @param playerColor - string with color of player's tokens
 */
var displayTextWhosTurn = function(nameOfPlayer, playerColor) {
    boxForCurrentPlayerDisplay.innerHTML = nameOfPlayer + " turn";
    boxForCurrentPlayerDisplay.style.color = playerColor;
};

/**
 * Changes draggable attribute to the needed value
 * @param thisPlayerTokensIds - array with ids of player's tokens
 * @param boolValue - true if allow dragging; false if block dragging
 */
var changeDraggableAttribute = function(thisPlayerTokensIds, boolValue) {
    for (var i = 0; i < thisPlayerTokensIds.length; i++) {
        document.getElementById(thisPlayerTokensIds[i]).setAttribute("draggable", boolValue);
    }
};

/**
 * Reset object 'currentTokensPositions' so all properties have empty strings
 */
var emptyVertices = function() {
    for (var property in currentTokensPositions) {
        if (currentTokensPositions.hasOwnProperty(property)) {
            currentTokensPositions[property] = "";
        }
    }
};

/**
 * Checks if a player has lost the game
 * The game is lost when all adjacent vertices for this player are occupied (player cannot move anymore)
 * @param player - string, property of object 'tokens'
 * @returns {boolean} - true if the player has lost, false if there is at least one free adjacent vertex
 */
var checkIfLose = function(player) {
    if (players.hasOwnProperty(player)) {
        var playersTokens = players[player].tokens;
        for (var i = 0; i < playersTokens.length; i++) { // check each token's adjacent vertices
            var thisTokenId = playersTokens[i];
            var tokenPosition = findWhereIsToken(thisTokenId);
            if (findFreeAdjacentVertex(tokenPosition)) {
                return false;
            }
        }
        return true;
    }
    console.log("This player does not exists (check properties of object 'tokens')");
};

/**
 * Checks whether vertex2 is one of the adjacent vertices of vertex1
 * @param vertex1Id - id of the first vertex
 * @param vertex2Id - id of the second vertex
 * @returns {boolean}
 */
var isAdjacent = function(vertex1Id, vertex2Id) {
    if (adjacentVertices.hasOwnProperty(vertex1Id)) {
        var vertex1AdjacentVertices = adjacentVertices[vertex1Id];
        for (var i = 0; i < vertex1AdjacentVertices.length; i++) {
            if (vertex1AdjacentVertices[i] == vertex2Id) {
                return true;
            }
        }
        return false;
    }
    console.log("vertexId argument is incorrect");
    return false;
};

/**
 * Find at which vertex the token is located
 * @param tokenId - find position of this token
 * @returns {string} id of the vertex which contains this token
 */
var findWhereIsToken = function(tokenId) {
    for (var vertex in currentTokensPositions) {
        if (currentTokensPositions[vertex] == tokenId) {
            return vertex;
        }
    }
    console.log("Token is not registered at any position in object 'currentTokensPositions'");
};

/**
 * Iterates through all adjacent vertices of input vertex and finds the first one which is free
 * @param vertexId - check all adjacent vertices of this vertex
 * @returns {*} - id of the free vertex or null if all the vertices are occupied
 */
var findFreeAdjacentVertex = function(vertexId) {
    if (adjacentVertices.hasOwnProperty(vertexId)) {
        var adjacent = adjacentVertices[vertexId];
        for (var i = 0; i < adjacent.length; i++) {
            var vertexElement = document.getElementById(adjacent[i]);
            if (!checkIfOccupied(vertexElement)) {
                return vertexElement.id;
            }
        }
        return null;
    }
    console.log("Input vertex id is incorrect");
    return null;
};

/**
 * Checks whether this vertex has any tokens inside
 * Sometimes target is not the container but the image itself of that container
 * That is why condition after OR is needed
 * @param targetVertex - vertex html element
 * @returns {boolean}
 */
var checkIfOccupied = function(targetVertex) {
    return checkIfOccupiedWithChildren(targetVertex.id) || targetVertex.nodeName == "IMG"
};

/**
 * Iterates through all the children of the vertex and checks if there is an image among them
 * @param vertexId - id of the vertex to check
 * @returns {boolean}
 */
var checkIfOccupiedWithChildren = function(vertexId) {
    var currentChildrenOfVertex = document.getElementById(vertexId).childNodes;
    for (var i = 0; i < currentChildrenOfVertex.length; i++) {
        if (currentChildrenOfVertex[i].nodeName == "IMG") {
            return true;
        }
    }
    return false;
};
