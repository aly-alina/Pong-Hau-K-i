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
var players = {
    "player1": {
        "name": "Player 1",
        "color": "#9ab7f3",
        "turn": false,
        "tokens": ["tokenPlayer1", "token2Player1"]
    },
    "player2": {
        "name": "Player 2",
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
                var users = [];
                var positionObjects = [];
                for (var i = 0; i < result.length; i++) {
                    var newUser = {
                        name: result[i]["name"],
                        city: result[i]["city"],
                        wins_num: result[i]["number_of_wins"]
                    };
                    users.push(newUser);
                }
                var geocoder =  new google.maps.Geocoder();
                for (var i = 0; i < users.length; i++) {
                    geocoder.geocode({'address': users[i].city}, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            positionObjects.push(results[0].geometry.location);
                        } else {
                            console.log("Marker wasn't added " + status);
                            // add empty object so in result positions array is of the same size as users array
                            // users may input fake cities
                            positionObjects.push({});
                        }
                        if (positionObjects.length == users.length) {
                            // indicator that all callback functions finished
                            displayMarkers(positionObjects);
                        }
                    });
                }
                function displayMarkers(positions) {
                    for (var i = 0; i < positions.length; i++) {
                        if (positions[i] != null) {
                            var marker = new google.maps.Marker({
                                position: positions[i],
                                map: map,
                                title: users[i].name + ", won " + users[i].wins_num + " times"
                            });
                            google.maps.event.addListener(marker,'click',function() {
                                var infowindow = new google.maps.InfoWindow({
                                    content: this.title
                                });
                                infowindow.open(map, this);
                            });
                        }
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
    if (players['player1'].turn) {
        stopPlayer1Turn();
    } else if (players['player2'].turn) {
        stopPlayer2Turn();
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
                console.log(results[0].geometry.location);
            } else {
                console.log("City does not exist");
            }
        });
        sendData(dataString);
        resetForm();
        $("#registration_form").hide();
        formIsOn = false;
        displayBoard();
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
    startPlayer1Turn();
};

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
    stop(players[playersPropertyName].name + " lost", players[playersPropertyName].color);
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
};

var stopPlayer1Turn = function() {
    players['player1'].turn = false;
    startPlayer2Turn();
};

var stopPlayer2Turn = function() {
    players['player2'].turn = false;
    startPlayer1Turn();
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
        },
        error: function (err) {
            console.log(err);
        }
    });
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
 * @param player - string, property of object 'tokens'
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