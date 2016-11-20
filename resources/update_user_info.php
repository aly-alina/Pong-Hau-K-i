<?php
    try {
        include 'db_config.php';
    } catch(Exception $e) {
        die(var_dump($e));
    }

    if(!empty($_POST)) {
        try {
            //check the last row of game table
            $sql_game_last_row = "SELECT * FROM game ORDER BY id DESC LIMIT 1";
            $result = $conn->query($sql_game_last_row);
            $games = $result->fetchAll();

            // check if a user can be player 1
            if ($result->rowCount() == 0 || $games[0]['game_is_on'] == false) {
                register_user($conn);
                insert_new_game($conn);
            } else {
                send_error_msg();
            }
        }
        catch(Exception $e) {
            die(var_dump($e));
        }
    }

    function send_error_msg() {
        header('HTTP/1.1 500 Internal Server Error');
        header('Content-Type: application/json; charset=UTF-8');
        die(json_encode(array('message' => 'ERROR', 'code' => 1337)));
    }

    function insert_new_game($conn) {
        $sql_game_insert = "INSERT INTO game (first_player_username) VALUES (?)";
        $first_player = $_POST['name'];
        $cursor = $conn->prepare($sql_game_insert);
        $cursor->bindValue(1, $first_player);
        $cursor->execute();
        echo "First player entered. Game created successfully";
    }

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
            echo "Registration was successful";
        } else {
            echo "User is already registered";
        }
    }

?>