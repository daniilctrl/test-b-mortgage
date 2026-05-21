--> statement-breakpoint
CREATE TABLE `Users` (
	`tgId` varchar(255) NOT NULL,
	`username` varchar(255),
	`firstName` varchar(255),
	`lastName` varchar(255),
	`langCode` varchar(10),
	`invitedBy` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Users_tgId` PRIMARY KEY(`tgId`)
);
