CREATE TABLE
    IF NOT EXISTS `0resmon_ph_houses` (
        id INT (11) NOT NULL AUTO_INCREMENT,
        type VARCHAR(32) DEFAULT NULL,
        label VARCHAR(64) NOT NULL,
        price INT (11) NOT NULL,
        door_coords TEXT NOT NULL,
        garage_coords TEXT DEFAULT NULL,
        coords_label VARCHAR(255) NOT NULL,
        meta LONGTEXT DEFAULT "{}",
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
        PRIMARY KEY (id)
    ) ENGINE = InnoDB AUTO_INCREMENT = 1;

CREATE TABLE
    IF NOT EXISTS `0resmon_ph_owned_houses` (
        id INT (11) NOT NULL AUTO_INCREMENT,
        houseId INT (11) NOT NULL UNIQUE,
        type VARCHAR(32) NOT NULL,
        owner VARCHAR(64) NOT NULL,
        owner_name VARCHAR(64) NOT NULL,
        options TEXT DEFAULT "{}",
        permissions MEDIUMTEXT DEFAULT "{}",
        furnitures LONGTEXT DEFAULT "{}",
        indicators MEDIUMTEXT DEFAULT "{}",
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
        CONSTRAINT fk_house_id FOREIGN KEY (houseId) REFERENCES `0resmon_ph_houses` (id),
        PRIMARY KEY (id)
    ) ENGINE = InnoDB AUTO_INCREMENT = 1;