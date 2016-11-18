CREATE TABLE game (
    id INT NOT NULL AUTO_INCREMENT,
    first_player_username VARCHAR(255),
    second_player_username VARCHAR(255),
    first_player_first_token VARCHAR(255),
    first_player_second_token VARCHAR(255),
    second_player_first_token VARCHAR(255),
    second_player_second_token VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    game_is_on BOOLEAN,
    winner INT,
    PRIMARY KEY (id),
    FOREIGN KEY (winner) REFERENCES users(id)
);