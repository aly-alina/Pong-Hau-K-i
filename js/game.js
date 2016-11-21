/* -------- GLOBAL VARIABLES -------- */

var gameIsOn = false;
var readmeIsOn = false;
var stopMessageOn = false;
var mapIsOn = false;
var formIsOn = false;
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
var player1 = {
    "my": {
        "name": "My",
        "color": "#9ab7f3",
        "turn": false,
        "tokens": ["tokenPlayer1", "token2Player1"]
    },
    "not_my": {
        "name": "Not my",
        "color": "#1abc9c",
        "turn": false,
        "tokens": ["tokenPlayer2", "token2Player2"]
    }
};
var player2 = {
    "not_my": {
        "name": "Not my",
        "color": "#9ab7f3",
        "turn": false,
        "tokens": ["tokenPlayer1", "token2Player1"]
    },
    "my": {
        "name": "My",
        "color": "#1abc9c",
        "turn": false,
        "tokens": ["tokenPlayer2", "token2Player2"]
    }
};
var playerPropertyMyName = "my";
var playerOpponentPropName = "not_my";
var players;
var isFirstPlayer;
var boxForCurrentPlayerDisplay = document.getElementById("whosTurn");
var vertexLeftEmpty = "";
var gameId = 0;
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
        if (mapIsOn) {
            turnOffMap();
        }
        $("#registration_form").show();
        formIsOn = true;
        // when form is submitted, game board is displayed, see #submit.click event
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
        if (mapIsOn) {
            turnOffMap();
        }
        if (formIsOn) {
            turnOffForm()
        }
        readmeIsOn = true;
        readmeBox.style.display = "block";
    }
};

var displayMap = function(e) {
    if (!gameIsOn && !mapIsOn) {
        if (stopMessageOn) {
            turnOffStopMessage();
        }
        if (readmeIsOn) {
            turnOffReadme();
        }
        if (formIsOn) {
            turnOffForm();
        }
        mapIsOn = true;
        $("#map_box").show();
        var thisCenter = {lat: 0, lng: 0};
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 1,
            center: thisCenter
        });
        $.ajax({
            url: "/resources/fetch_user_info.php",
            data: "",
            dataType: 'json',
            success: function(result){
                for (var i = 0; i < result.length; i++) {
                    if (result[i]["lat"] != null && result[i]["lng"] != null) {
                        var marker = new google.maps.Marker({
                            position: new google.maps.LatLng(result[i]["lat"], result[i]["lng"]),
                            map: map,
                            title: result[i]["name"] + ", won " + result[i]["number_of_wins"] + " times"
                        });
                        google.maps.event.addListener(marker,'click',function() {
                            var infowindow = new google.maps.InfoWindow({
                                content: this.title
                            });
                            infowindow.open(map, this);
                        });
                    }
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
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
    if (checkIfLose(playerOpponentPropName)) {
        sendWinner();
        lose(playerOpponentPropName);
    } else {
        sendPositionsUpdate();
        stopTurn();
        wait();
    }
};

$("#submit").click(function(){
    var name = $("#form > input[name='name']").val();
    var city = $("#form > input[name='city']").val();
    var age = $("#form > input[name='age']").val();
    if (name == '' || city == '' || age == '' || isNaN(parseInt(age))) {
        alert('Some fields are empty or incorrect');
    }
    else {
        var dataString = 'name='+ name + '&city='+ city + '&age='+ age;
        var geocoder =  new google.maps.Geocoder();
        geocoder.geocode({'address': city}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var location = results[0].geometry.location;
                var latitude = location.lat();
                var longitude = location.lng();
                dataString += '&latitude=' + latitude + '&longitude=' + longitude;
            } else {
                console.log('Geocoder failed');
            }
            sendData(dataString);
            // board is displayed inside sendData
        });
    }
});

/* -------- CONTROL ------------ */

var resetForm = function() {
    $("#form > input[name='name']").val("");
    $("#form > input[name='city']").val("");
    $("#form > input[name='age']").val("");
};

var displayBoard = function() {
    gameIsOn = true;
    gameBoardBox.style.display = "block";
    reset();
    if (isFirstPlayer) {
        startTurn();
    } else {
        stopTurn();
        wait();
    }
};

var determinePlayer = function(resultingStr) {
    if (resultingStr.indexOf("player 1") !== -1) {
        players = player1;
        isFirstPlayer = true;
    } else if (resultingStr.indexOf("player 2") !== -1) {
        players = player2;
        isFirstPlayer = false;
    } else {
        console.log("player is not determined");
        window.location.href = "/error.html";
    }
};

var determineId = function(resultStr) {
    var str = "game id is:";
    if (resultStr.indexOf(str) !== -1) {
        var indexIdStart = resultStr.indexOf(str) + str.length;
        var indexIdEnds = resultStr.indexOf('.', indexIdStart);
        var id = resultStr.substring(indexIdStart, indexIdEnds);
        gameId = parseInt(id);
    } else {
        console.log("game id is not determined");
        window.location.href = "/error.html";
    }
};

var reset = function() {
    vertexLeftEmpty = "";
    emptyVertices();
    players[playerPropertyMyName].turn = false;
    players[playerOpponentPropName].turn = false;
    if (isFirstPlayer) {
        initTokensOfAPlayer(initialVerticesPlayer1, players[playerPropertyMyName].tokens);
        initTokensOfAPlayer(initialVerticesPlayer2, players[playerOpponentPropName].tokens);
    } else {
        initTokensOfAPlayer(initialVerticesPlayer1, players[playerOpponentPropName].tokens);
        initTokensOfAPlayer(initialVerticesPlayer2, players[playerPropertyMyName].tokens);
    }
};

var lose = function(playersPropertyName) {
    stop(players[playersPropertyName].name + " lost", 'black');
};

var stop = function(text, color) {
    if (gameIsOn) {
        gameIsOn = false;
        gameBoardBox.style.display = "none";
        stopBox.style.display = "block";
        stopBox.innerHTML = "Game is over. " + text;
        stopBox.style.color = color;
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

var turnOffMap = function() {
    $("#map_box").hide();
    mapIsOn = false;
};

var turnOffForm = function() {
    $("#registration_form").hide();
    formIsOn = false;
};

var startTurn = function() {
    players[playerOpponentPropName].turn = false;
    players[playerPropertyMyName].turn = true;
    displayTextWhosTurn(players[playerPropertyMyName].name, players[playerPropertyMyName].color);
    changeDraggableAttribute(players[playerPropertyMyName].tokens, true);
    changeDraggableAttribute(players[playerOpponentPropName].tokens, false);
};

var wait = function() {
    displayTextWhosTurn(players[playerOpponentPropName].name, players[playerOpponentPropName].color);
    changeDraggableAttribute(players[playerOpponentPropName].tokens, false);
    changeDraggableAttribute(players[playerPropertyMyName].tokens, false);
    setTimeout(waitLoop, 5000);
};

function waitLoop() {
    console.log('in wait loop');
    $.ajax({
        url: "/resources/fetch_game_info_with_id.php",
        type: "POST",
        data: '&id=' + gameId,
        cache: false,
        dataType: 'json',
        success: function(result){
            if(checkIfNeedToWaitMore(result[0])) {
                setTimeout(waitLoop, 5000);
            }
        },
        error: function (err) {
            console.log('exception caught');
            console.log(err);
            window.location.href = "/error.html";
        }
    });
};

var checkIfNeedToWaitMore = function(result) {
    var winner = result['winner'];
    if (winner !== null) {
        lose(playerPropertyMyName);
        return false;
    }
    var online = result['game_is_on'];
    if (online == 0) {
        stop("Your game time has expired (someone else is plying)", 'black');
        return false;
    }
    var new_positions = {
        'topLeftVertex': result['top_left_vertex'],
        'topRightVertex': result['top_right_vertex'],
        'middleVertex': result['middle_vertex'],
        'bottomLeftVertex': result['bottom_left_vertex'],
        'bottomRightVertex': result['bottom_right_vertex']
    };
    for (var property in new_positions) {
        if (new_positions.hasOwnProperty(property)) {
            if (new_positions[property] === null) {
                new_positions[property] = "";
            }
        }
    }
    if (check_if_positions_changed(new_positions, currentTokensPositions)) {
        change_tokens_locations(new_positions);
        currentTokensPositions = new_positions;
        startTurn();
        return false;
    } else {
        return true;
    }
};

var stopTurn = function() {
    players[playerPropertyMyName].turn = false;
    players[playerOpponentPropName].turn = true;
};

/* ------------- OTHER FUNCTIONS -------- */

var sendData = function(dataString) {
    $.ajax({
        type: "POST",
        url: "/resources/update_user_info.php",
        data: dataString,
        cache: false,
        success: function(result){
            console.log(result);
            resetForm();
            $("#registration_form").hide();
            formIsOn = false;
            determinePlayer(result);
            determineId(result);
            displayBoard();
        },
        error: function (err) {
            console.log('exception caught');
            console.log(err);
            window.location.href = "/error.html";
        }
    });
};

var sendPositionsUpdate = function() {
    var dataString = "";
    for (var property in currentTokensPositions) {
        if (currentTokensPositions.hasOwnProperty(property)) {
            if (currentTokensPositions[property]) {
                dataString += '&' + property + '=' + currentTokensPositions[property];
            }
        }
    }
    dataString += '&id=' + gameId;
    $.ajax({
        type: "POST",
        url: "/resources/update_game_info.php",
        data: dataString,
        cache: false,
        success: function(result){
            console.log(result);
        },
        error: function (err) {
            console.log('exception caught');
            console.log(err);
            window.location.href = "/error.html";
        }
    });
};

var sendWinner = function() {
    var winnerInt = (isFirstPlayer) ? 1 : 2;
    $.ajax({
        type: "POST",
        url: "/resources/update_winner.php",
        data: '&id=' + gameId + '&winner=' + winnerInt,
        cache: false,
        success: function(result){
            console.log(result);
        },
        error: function (err) {
            console.log('exception caught');
            console.log(err);
            window.location.href = "/error.html";
        }
    });
};

/**
 * Check is the object has same values as currentPositions
 * @param positions - object with properties similar to currentTokensPositions
 */
var check_if_positions_changed = function(positions, currentPositions) {
    for (var property in currentPositions) {
        if (currentPositions.hasOwnProperty(property)) {
            if (currentPositions[property] != positions[property]) {
                return true;
            }
        }
    }
    return false;
};

var change_tokens_locations = function(newPositions) {
    for (var property in newPositions) {
        if (newPositions.hasOwnProperty(property)) {
            if (newPositions[property]) {
                var vertexId = "#" + property;
                var tokenId = "#" + newPositions[property];
                $(vertexId).append($(tokenId));
            }
        }
    }
};

/**
 * Moves tokens of a player i into the initial vertices so, resets tokens' positions
 * @param initVerticesIds - array with vertices ids: which vertices put tokens in
 * @param playerTokensIds - array with ids of tokens of this player
 */
var initTokensOfAPlayer = function (initVerticesIds, playerTokensIds) {
    for (var i = 0; i < initVerticesIds.length; i++) {
        // move token to initial position
        document.getElementById(initVerticesIds[i])
            .appendChild(document.getElementById(playerTokensIds[i]));
        currentTokensPositions[initVerticesIds[i]] = playerTokensIds[i];
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
 * @param player - string, property of object 'players'
 * @returns {boolean} - true if the player has lost, false if there is at least one free adjacent vertex
 */
var checkIfLose = function(player) {
    if (players.hasOwnProperty(player)) {
        var playersTokens = players[player].tokens;
        for (var i = 0; i < playersTokens.length; i++) { // check each token's adjacent vertices
            var thisTokenId = playersTokens[i];
            var tokenPosition = findWhereIsToken(thisTokenId);
            if (!checkIfAllAdjacentAreOccupied(tokenPosition)) {
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
 * Iterates through all adjacent vertices of input vertex and checks whether they are free or not
 * @param vertexId - check all adjacent vertices of this vertex
 * @returns {boolean} - true if all adjacent vertices are occupied;
 * false if at least one adjacent vertex is free
 */
var checkIfAllAdjacentAreOccupied = function(vertexId) {
    if (adjacentVertices.hasOwnProperty(vertexId)) {
        var adjacent = adjacentVertices[vertexId];
        for (var i = 0; i < adjacent.length; i++) {
            var vertexElement = document.getElementById(adjacent[i]);
            if (!checkIfOccupied(vertexElement)) {
                return false;
            }
        }
        return true;
    }
    console.log("Input vertex id is incorrect");
    return true;
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