CREATE TABLE `MortgageCalculations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`mortgageProfileId` int NOT NULL,
	`monthlyPayment` decimal(20,2) NOT NULL,
	`totalPayment` decimal(20,2) NOT NULL,
	`totalOverpaymentAmount` decimal(20,2) NOT NULL,
	`possibleTaxDeduction` decimal(20,2) NOT NULL,
	`savingsDueMotherCapital` decimal(20,2) NOT NULL,
	`recommendedIncome` decimal(20,2) NOT NULL,
	`paymentSchedule` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `MortgageCalculations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `MortgageProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`propertyPrice` decimal(20,2) NOT NULL,
	`propertyType` enum('apartment_in_new_building','apartment_in_secondary_building','house','house_with_land_plot','land_plot','other') NOT NULL,
	`downPaymentAmount` decimal(20,2) NOT NULL,
	`matCapitalAmount` decimal(20,2),
	`matCapitalIncluded` boolean NOT NULL,
	`mortgageTermYears` int NOT NULL,
	`interestRate` decimal(6,3) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `MortgageProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `MortgageCalculations` ADD CONSTRAINT `MortgageCalculations_userId_Users_tgId_fk` FOREIGN KEY (`userId`) REFERENCES `Users`(`tgId`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `MortgageCalculations` ADD CONSTRAINT `MortgageCalculations_mortgageProfileId_MortgageProfiles_id_fk` FOREIGN KEY (`mortgageProfileId`) REFERENCES `MortgageProfiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `MortgageProfiles` ADD CONSTRAINT `MortgageProfiles_userId_Users_tgId_fk` FOREIGN KEY (`userId`) REFERENCES `Users`(`tgId`) ON DELETE no action ON UPDATE no action;