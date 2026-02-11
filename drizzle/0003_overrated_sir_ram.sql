CREATE TABLE `card_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cardId` varchar(64) NOT NULL,
	`cardText` text NOT NULL,
	`cardImageUrl` varchar(512) NOT NULL,
	`tags` json,
	`guide` varchar(64) NOT NULL,
	`drawnAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `card_history_id` PRIMARY KEY(`id`)
);
