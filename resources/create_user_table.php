<?php
    include 'db_config.php';
    $sql = "CREATE TABLE users (
                id INT NOT NULL AUTO_INCREMENT,
                name VARCHAR(30) NOT NULL,
                city VARCHAR(30) NOT NULL,
                age INT NOT NULL,
                PRIMARY KEY (id))";
    $conn->query($sql);
    echo "<h3>Table created.</h3>";
?>