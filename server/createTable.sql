
CREATE TABLE matches (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  match_uuid VARCHAR(64) UNIQUE NOT NULL,
  match_name VARCHAR(255),
  status ENUM('pending', 'ongoing', 'completed', 'cancelled') DEFAULT 'pending',
  winner_clan VARCHAR(100) DEFAULT NULL,
  start_time DATETIME DEFAULT NULL,
  end_time DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);




CREATE TABLE match_clans (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  match_uuid VARCHAR(64) NOT NULL,
  clan_name VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_uuid) REFERENCES matches(match_uuid) ON DELETE CASCADE
);




CREATE TABLE bets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  match_uuid VARCHAR(64) NOT NULL,
  player_id BIGINT NOT NULL,
  username VARCHAR(255) NOT NULL,
  clan_name VARCHAR(100) NOT NULL,
  bet_amount DECIMAL(10,2) DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_uuid) REFERENCES matches(match_uuid) ON DELETE CASCADE
);


CREATE TABLE `fixed_winners_settings` (
  `id` int(11) NOT NULL,
  `game_name` enum('TigerDragon','AndarBahar','7Up7Down','JhandiMunda','CarRoulette') NOT NULL,
  `fixed_clan` varchar(255) NOT NULL,
  `enabled` tinyint(1) DEFAULT 0,
  `total_match` int(11) DEFAULT 0,
  `completed_match` int(11) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

ALTER TABLE `fixed_winners_settings`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `fixed_winners_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;


ALTER TABLE fixed_winners_settings
MODIFY COLUMN fixed_clan JSON NOT NULL;

INSERT INTO fixed_winners_settings 
(game_name, fixed_clan, enabled, total_match, completed_match, created_at, updated_at)
VALUES
('TigerDragon', '["tiger", "dragon", "tie"]', 0, 0, 0, NOW(), NOW()),
('AndarBahar', '["andar", "bahar"]', 0, 0, 0, NOW(), NOW()),
('7Up7Down', '["lessThan7", "equalTo7", "moreThan7"]', 0, 0, 0, NOW(), NOW()),
('JhandiMunda', '["fig1", "fig2", "fig3", "fig4", "fig5", "fig6"]', 0, 0, 0, NOW(), NOW()),
('CarRoulette', '["ferrari", "lamborghini", "porsche", "mercedes", "bmw", "audi", "mahindra", "tataMotors"]', 0, 0, 0, NOW(), NOW());



CREATE TABLE `game_clans` (
  `id` int(11) NOT NULL,
  `game_name` varchar(255) NOT NULL,
  `clan_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


INSERT INTO `game_clans` (`id`, `game_name`, `clan_name`) VALUES
(1, 'TigerDragon', 'tiger'),
(2, 'TigerDragon', 'dragon'),
(3, 'TigerDragon', 'tie'),
(4, 'AndarBahar', 'andar'),
(5, 'AndarBahar', 'bahar'),
(6, '7Up7Down', 'lessThan7'),
(7, '7Up7Down', 'equalTo7'),
(8, '7Up7Down', 'moreThan7'),
(9, 'JhandiMunda', 'fig1'),
(10, 'JhandiMunda', 'fig2'),
(11, 'JhandiMunda', 'fig3'),
(12, 'JhandiMunda', 'fig4'),
(13, 'JhandiMunda', 'fig5'),
(14, 'JhandiMunda', 'fig6'),
(15, 'CarRoulette', 'ferrari'),
(16, 'CarRoulette', 'lamborghini'),
(17, 'CarRoulette', 'porsche'),
(18, 'CarRoulette', 'mercedes'),
(19, 'CarRoulette', 'bmw'),
(20, 'CarRoulette', 'audi'),
(21, 'CarRoulette', 'mahindra'),
(22, 'CarRoulette', 'tataMotors');


--
ALTER TABLE `game_clans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `game_name` (`game_name`,`clan_name`);


ALTER TABLE `game_clans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;




-- sync need with server after this line 


    CREATE TABLE fixed_winners_settings_jobs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_name ENUM('TigerDragon','AndarBahar','7Up7Down','JhandiMunda','CarRoulette') NOT NULL,
      fixed_clan JSON NOT NULL,               -- upcoming winner array
      total_match INT NOT NULL,
      execute_at DATETIME NOT NULL,           -- when to enable (IST - Indian Standard Time)
      status ENUM('pending','running','completed','failed') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE fixed_winner_jobs
  ADD COLUMN fail_reason VARCHAR(255) NULL DEFAULT NULL;



insert into fixed_winners_settings_jobs(
  game_name,
  fixed_clan,
  total_match,
  execute_at,
)values('TigerDragon','["tiger","dragon","tie"]',3,NOW())