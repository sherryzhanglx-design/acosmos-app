CREATE TABLE `usage_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`actionType` enum('conversation_start','message_sent','card_drawn','apex_session','voice_input') NOT NULL,
	`guardianSlug` varchar(64),
	`conversationId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usage_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tier` enum('free','basic','premium') NOT NULL DEFAULT 'free',
	`dailyConversations` int NOT NULL DEFAULT 0,
	`weeklyConversations` int NOT NULL DEFAULT 0,
	`monthlyConversations` int NOT NULL DEFAULT 0,
	`totalConversations` int NOT NULL DEFAULT 0,
	`dailyMessages` int NOT NULL DEFAULT 0,
	`totalMessages` int NOT NULL DEFAULT 0,
	`lastDailyReset` varchar(10),
	`lastWeeklyReset` varchar(10),
	`lastMonthlyReset` varchar(7),
	`subscriptionStartedAt` timestamp,
	`subscriptionEndsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_usage_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_usage_userId_unique` UNIQUE(`userId`)
);
