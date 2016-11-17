<?php
    
    $host = "127.0.0.1:3306";
    $user = "root";
    $pwd = "";
    $db = "pong_hau_ki";
    try {
        $conn = new PDO( "mysql:host=$host;dbname=$db", $user, $pwd);
        $conn->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
    }
    catch (PDOException $e) {
        die('unable to connect to database ' . $e->getMessage());
    }

?>