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
                register_player_1($conn);
            } else {
                date_default_timezone_set("UTC");
                $now = new DateTime();
                $last_updated = new DateTime($games[0]['last_updated']);
                $interval = $now->diff($last_updated);
                if ($interval->h < 1) {
                    $seconds = $interval->i*60 + $interval->s;
                    if ($seconds > 900) {
                        echo "More than 15 minutes elapsed. ";
                        put_previous_game_offline($conn, $games[0]['id']);
                        register_player_1($conn);
                    } else {
                        echo "Less than 15 minutes elapsed. ";
                        send_error_msg();
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

    function send_error_msg() {
        header('HTTP/1.1 500 Internal Server Error');
        header('Content-Type: application/json; charset=UTF-8');
        die(json_encode(array('message' => 'ERROR', 'code' => 1337)));
    }

    function insert_new_game($conn) {
        date_default_timezone_set("UTC");
        $now = new DateTime();
        $sql_game_insert = "INSERT INTO game (first_player_username, last_updated) VALUES (?, ?)";
        $first_player = $_POST['name'];
        $cursor = $conn->prepare($sql_game_insert);
        $cursor->bindValue(1, $first_player);
        $cursor->bindValue(2, date($now->format('Y-m-d H:i:s')));
        $cursor->execute();
        echo "First player entered. Game created successfully. ";
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
            echo "Registration was successful. ";
        } else {
            echo "User is already registered. ";
        }
    }

    function register_player_1($conn) {
        register_user($conn);
        insert_new_game($conn);
    }

    function put_previous_game_offline($conn, $game_id) {
        $sql = "UPDATE game SET game_is_on='0' WHERE id=(?)";
        $cursor = $conn->prepare($sql);
        $cursor->bindValue(1, $game_id);
        $cursor->execute();
    }

?>