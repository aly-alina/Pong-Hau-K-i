CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    number_of_wins INT DEFAULT 0,
    PRIMARY KEY (id)
);