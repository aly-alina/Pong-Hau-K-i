<?php
    include 'db_config.php';
    $sql = "CREATE TABLE game (
        id INT NOT NULL AUTO_INCREMENT,
        first_player_username VARCHAR(255) NOT NULL,
        second_player_username VARCHAR(255),
        first_player_first_token VARCHAR(255),
        first_player_second_token VARCHAR(255),
        second_player_first_token VARCHAR(255),
        second_player_second_token VARCHAR(255),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        game_is_on BOOLEAN DEFAULT 1,
        winner INT,
        PRIMARY KEY (id),
        FOREIGN KEY (winner) REFERENCES users(id))";
    $conn->query($sql);
    echo "<h3>Table created.</h3>";
?>