<?php
    include 'db_config.php';
    if(!empty($_POST)) {
        try {
            $name = $_POST['name'];
            $city = $_POST['city'];
            $age = $_POST['age'];
            $sql_insert = "INSERT INTO users (name, city, age) 
                           VALUES (?,?,?)";
            $cursor = $conn->prepare($sql_insert);
            $cursor->bindValue(1, $name);
            $cursor->bindValue(2, $city);
            $cursor->bindValue(3, $age);
            $cursor->execute();
        }
        catch(Exception $e) {
            die(var_dump($e));
        }
        echo "Registration was successful";
    }
?>