<?php
    try {
        include 'db_config.php';
    } catch(Exception $e) {
        die(var_dump($e));
    }

    if(!empty($_POST)) {
        try {
            $result = select_last_row($conn);
            $games = $result->fetchAll();
            // no entries in the table OR last game is offline
            if ($result->rowCount() == 0 || $games[0]['game_is_on'] == false) {
                register_player_1($conn);
            } else {
                // calculating how much time elapsed since last online game
                date_default_timezone_set("UTC");
                $now = new DateTime();
                $last_updated = new DateTime($games[0]['last_updated']);
                $interval = $now->diff($last_updated);
                if ($interval->h < 1 && $interval->d < 1 && $interval->m < 1 && $interval->y < 1) {
                    $seconds = $interval->i*60 + $interval->s;
                    if ($seconds > 900) {
                        echo "More than 15 minutes elapsed. ";
                        put_previous_game_offline($conn, $games[0]['id']);
                        register_player_1($conn);
                    } else {
                        if ($games[0]['second_player_username'] == null) {
                            register_player_2($conn, $games[0]['id'], $games[0]['last_updated']);
                        } else {
                            echo "Less than 15 minutes elapsed. ";
                            send_error_msg(); // only one game at the time is allowed
                        }
                    }
                } else {
                    echo "More than 15 minutes elapsed. ";
                    put_previous_game_offline($conn, $games[0]['id']);
                    register_player_1($conn);
                }
            }
        }
        catch(Exception $e) {
            send_error_msg();
            die(var_dump($e));
        }
    }

    /**
     * Send error message to ajax call indicating that the server already serves a game thus,
     * this user cannot play till the current game is over
     */
    function send_error_msg() {
        header('HTTP/1.1 500 Internal Server Error');
        header('Content-Type: application/json; charset=UTF-8');
        die(json_encode(array('message' => 'ERROR', 'code' => 1337)));
    }

    /**
     * Inserts new game to the 'game' table and indicates who is the first player
     * created the game.
     * Time is updated manually since some mysql databases store dates in other timezones
     * than UTC.
     * @param $conn - db connection variable
     */
    function insert_new_game($conn) {
        date_default_timezone_set("UTC");
        $now = new DateTime();
        $now_formatted = $now->format('Y-m-d H:i:s');
        $sql_game_insert = "INSERT INTO game (first_player_username, last_updated) VALUES (?, ?)";
        $first_player = $_POST['name'];
        $cursor = $conn->prepare($sql_game_insert);
        $cursor->bindValue(1, $first_player);
        $cursor->bindValue(2, date($now_formatted));
        $cursor->execute();
        echo "First player entered. Game created successfully. ";
    }

    /**
     * Registers a user in the database.
     * If a user denoted invalid city ($_POST doesn't contain lat and lng),
     * leave the fields blank otherwise, insert lat and lng too.
     * @param $conn - db connection variable
     */
    function register_user($conn) {
        try {
            $username = $_POST['name'];
            $city = $_POST['city'];
            $age = $_POST['age'];
            $sql_select = "SELECT * FROM users WHERE name LIKE '" . $username . "'";
            $result = $conn->query($sql_select);
        } catch(Exception $e) {
            die(var_dump($e));
        }
        if ($result->rowCount() == 0) {
            $sql_insert = "INSERT INTO users (name, city, age)
                                           VALUES (?,?,?)";
            $sql_insert_with_latlng = "INSERT INTO users (name, city, age, lat, lng)
                                               VALUES (?,?,?,?,?)";
            //set lat and lng if they are in the form data
            if (isset($_POST['latitude']) && isset($_POST['longitude'])) {
                $latitude = $_POST['latitude'];
                $longitude = $_POST['longitude'];
                $cursor = $conn->prepare($sql_insert_with_latlng);
                $cursor->bindValue(1, $username);
                $cursor->bindValue(2, $city);
                $cursor->bindValue(3, $age);
                $cursor->bindValue(4, $latitude);
                $cursor->bindValue(5, $longitude);
            } else {
                $cursor = $conn->prepare($sql_insert);
                $cursor->bindValue(1, $username);
                $cursor->bindValue(2, $city);
                $cursor->bindValue(3, $age);
            }
            $cursor->execute();
            echo "Registration was successful. ";
        } else {
            echo "User is already registered. ";
        }
    }

    /**
     * Registers first player
     * @param $conn - db connection variable
     */
    function register_player_1($conn) {
        register_user($conn);
        insert_new_game($conn);
        echo "You are player 1. ";
        $id = select_last_row($conn)->fetchAll()[0]['id'];
        echo "Your game id is: $id.";
    }

    /**
     * Registers second player.
     * @param $conn - db connection variable
     * @param $game_id - id of the last online game (the game waiting for the second player)
     * @param $last_updated - the time player 1 entered the game
     */
    function register_player_2($conn, $game_id, $last_updated) {
        register_user($conn);
        $username = $_POST['name'];
        $sql = "UPDATE game SET second_player_username=(?) WHERE id=(?)";
        $cursor = $conn->prepare($sql);
        $cursor->bindValue(1, $username);
        $cursor->bindValue(2, $game_id);
        $cursor->execute();
        $game = select_last_row($conn)->fetchAll();
        // if time before inserting second player and after are the same, update
        if (strpos($game[0]['last_updated'], $last_updated) !== false) {
            update_time_of_last_game($conn, $game_id);
        }
        echo "You are player 2. ";
        $id = select_last_row($conn)->fetchAll()[0]['id'];
        echo "Your game id is: $id.";
    }

    /**
     * Put the last online game offline.
     * Used when the game haven't been updated for 15 mins therefore, got expired
     * and the server may serve new game
     * @param $conn - db connection variable
     * @param $game_id - id of the last online game
     */
    function put_previous_game_offline($conn, $game_id) {
        $sql = "UPDATE game SET game_is_on='0' WHERE id=(?)";
        $cursor = $conn->prepare($sql);
        $cursor->bindValue(1, $game_id);
        $cursor->execute();
    }

    function select_last_row($conn) {
        $sql_game_last_row = "SELECT * FROM game ORDER BY id DESC LIMIT 1";
        $result = $conn->query($sql_game_last_row);
        return $result;
    }

    /**
     * Since some mysql servers don't store time in UTC, time
     * has to be updated manually to make sure only UTC is stored in the db
     * @param $conn - db connection variable
     * @param $game_id - id of the last online game
     */
    function update_time_of_last_game($conn, $game_id) {
        date_default_timezone_set("UTC");
        $now = new DateTime();
        $sql = "UPDATE game SET last_updated=(?) WHERE id=(?)";
        $cursor = $conn->prepare($sql);
        $cursor->bindValue(1, $now->format('Y-m-d H:i:s'));
        $cursor->bindValue(2, $game_id);
        $cursor->execute();
    }

?>