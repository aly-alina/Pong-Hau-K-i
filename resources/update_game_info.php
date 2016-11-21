<?php
    try {
        include 'db_config.php';
        $id = $_POST['id'];
        date_default_timezone_set("UTC");
        $now = new DateTime();
        $topLeft = parse_values_from_post('topLeftVertex');
        $topRight = parse_values_from_post('topRightVertex');
        $middle = parse_values_from_post('middleVertex');
        $bottomLeft = parse_values_from_post('bottomLeftVertex');
        $bottomRight = parse_values_from_post('bottomRightVertex');
        $sql_insert = "UPDATE game SET 
            top_left_vertex=(?), 
            top_right_vertex=(?), 
            middle_vertex=(?), 
            bottom_left_vertex=(?), 
            bottom_right_vertex=(?),
            last_updated=(?)
            WHERE id=(?)";
        $cursor = $conn->prepare($sql_insert);
        $cursor->bindValue(1, $topLeft);
        $cursor->bindValue(2, $topRight);
        $cursor->bindValue(3, $middle);
        $cursor->bindValue(4, $bottomLeft);
        $cursor->bindValue(5, $bottomRight);
        $cursor->bindValue(6, $now->format('Y-m-d H:i:s'));
        $cursor->bindValue(7, $id);
        $cursor->execute();
        echo "Game updated successfully";
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

    /**
     * If value inside is not empty, return it, otherwise, return NULL (it means the vertex is empty)
     * @param $str
     * @return string
     */
    function parse_values_from_post($str) {
        if (isset($_POST[$str])) {
            return $_POST[$str];
        } else {
            return null;
        }
    }
?>