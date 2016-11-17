<?php
    include 'db_config.php';
    $sql_select = "SELECT * FROM users";
    $cursor = $conn->query($sql_select);
    $users = $cursor->fetchAll();
    echo json_encode($users);
?>