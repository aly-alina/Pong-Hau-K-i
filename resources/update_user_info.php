<?php
    include 'db_config.php';
    if(!empty($_POST)) {
        try {
            $name = $_POST['name'];
            $city = $_POST['city'];
            $age = $_POST['age'];
            $sql_insert = "INSERT INTO users (name, city, age)
                                       VALUES (?,?,?)";
            $sql_insert_with_latlng = "INSERT INTO users (name, city, age, lat, lng)
                                       VALUES (?,?,?,?,?)";
            if (isset($_POST['latitude']) && isset($_POST['longitude'])) {
                $latitude = $_POST['latitude'];
                $longitude = $_POST['longitude'];
                $cursor = $conn->prepare($sql_insert_with_latlng);
                $cursor->bindValue(1, $name);
                $cursor->bindValue(2, $city);
                $cursor->bindValue(3, $age);
                $cursor->bindValue(4, $latitude);
                $cursor->bindValue(5, $longitude);
            } else {
                $cursor = $conn->prepare($sql_insert);
                $cursor->bindValue(1, $name);
                $cursor->bindValue(2, $city);
                $cursor->bindValue(3, $age);
            }
            $cursor->execute();
        }
        catch(Exception $e) {
            die(var_dump($e));
        }
        echo "Registration was successful";
    }
?>