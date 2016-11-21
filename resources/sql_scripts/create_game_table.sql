CREATE TABLE game (
    id INT NOT NULL AUTO_INCREMENT,
    first_player_username VARCHAR(255) NOT NULL,
    second_player_username VARCHAR(255),
    top_left_vertex VARCHAR(255) DEFAULT 'tokenPlayer1',
    top_right_vertex VARCHAR(255) DEFAULT 'token2Player1',
    middle_vertex VARCHAR(255) DEFAULT NULL,
    bottom_left_vertex VARCHAR(255) DEFAULT 'tokenPlayer2',
    bottom_right_vertex VARCHAR(255) DEFAULT 'token2Player2',
    last_updated TIMESTAMP,
    game_is_on BOOLEAN DEFAULT 1,
    winner INT,
    PRIMARY KEY (id),
    FOREIGN KEY (winner) REFERENCES users(id));