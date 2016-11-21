<?php
    try {
        include 'db_config.php';
        $sql_game_last_row = "SELECT top_left_vertex,
            top_right_vertex,
            middle_vertex,
            bottom_left_vertex,
            bottom_right_vertex
            FROM game ORDER BY id DESC LIMIT 1";
        $result = $conn->query($sql_game_last_row);
        $games = $result->fetchAll();
        echo json_encode($games);
    } catch(Exception $e) {
        send_error_msg();
        die(var_dump($e));
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