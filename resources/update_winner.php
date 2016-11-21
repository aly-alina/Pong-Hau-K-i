<?php
    try {
        include 'db_config.php';
    } catch(Exception $e) {
        send_error_msg();
        die(var_dump($e));
    }

    try {
        $winner = $_POST['winner'];
        $id = $_POST['id'];
        send_winner_to_game_with_id($conn, $id, $winner);
        increment_win($conn, $winner, $id);
        echo "Winner added successfully";
    } catch(Exception $e) {
        send_error_msg();
        die(var_dump($e));
    }

    function increment_win($conn, $winner, $id) {
        if ($winner == 1) {
            $col = 'first_player_username';
        } else if ($winner == 2) {
            $col='second_player_username';
        }
        $sql_select = "SELECT $col FROM game WHERE id='$id'";
        $result = $conn->query($sql_select);
        $users = $result->fetchAll();
        $username = $users[0][$col];
        $sql_insert = "UPDATE users SET
            number_of_wins=number_of_wins + 1
            WHERE name=(?)";
        $cursor = $conn->prepare($sql_insert);
        $cursor->bindValue(1, $username);
        $cursor->execute();
    }

    function send_winner_to_game_with_id($conn, $id, $winner) {
        date_default_timezone_set("UTC");
        $now = new DateTime();
        $sql_insert = "UPDATE game SET
            winner=(?),
            last_updated=(?),
            game_is_on=0
            WHERE id=(?)";
        $cursor = $conn->prepare($sql_insert);
        $cursor->bindValue(1, $winner);
        $cursor->bindValue(2, $now->format('Y-m-d H:i:s'));
        $cursor->bindValue(3, $id);
        $cursor->execute();
    }

    function get_last_game_id($conn) {
        $sql_game_last_row = "SELECT * FROM game ORDER BY id DESC LIMIT 1";
        $result = $conn->query($sql_game_last_row);
        $games = $result->fetchAll();
        return $games[0]['id'];
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
?>