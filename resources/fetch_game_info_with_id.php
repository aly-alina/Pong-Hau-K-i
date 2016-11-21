<?php
    try {
        include 'db_config.php';
        $id = $_POST['id'];
        $sql_game = "SELECT * FROM game WHERE id = '$id'";
        $result = $conn->query($sql_game);
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