-- =====================================================================
--  BrunoVerse – MySQL schema
--  Spring Boot creates/updates these tables automatically (ddl-auto=update).
--  This file is for reference, or to create the database by hand:
--      mysql -u root -p < database/schema.sql
--  Nested lists (vaccinations, timeline, chat messages…) are stored as JSON text.
-- =====================================================================
CREATE DATABASE IF NOT EXISTS brunoverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE brunoverse;

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255), `email` VARCHAR(255) UNIQUE, `password` VARCHAR(255) COMMENT 'BCrypt hash',
  `phone` VARCHAR(255), `role` VARCHAR(255) COMMENT 'owner | rescuer | feeder | vet | ngo',
  `city` VARCHAR(255), `avatar` VARCHAR(512), `joined` BIGINT, `available` BIT(1),
  `baseCompleted` INT, `baseHelped` INT, `lat` DOUBLE, `lng` DOUBLE, `dLat` DOUBLE, `dLng` DOUBLE
);

CREATE TABLE IF NOT EXISTS `places` (
  `id` VARCHAR(64) PRIMARY KEY,
  `type` VARCHAR(255) COMMENT 'vet | ngo | shelter | rescuer | feeder', `name` VARCHAR(255), `phone` VARCHAR(255),
  `lat` DOUBLE, `lng` DOUBLE, `dLat` DOUBLE, `dLng` DOUBLE, `hours` VARCHAR(255), `verified` BIT(1),
  `services` VARCHAR(255), `rating` DOUBLE, `emergency` BIT(1), `osm` BIT(1)
);

CREATE TABLE IF NOT EXISTS `rescue_cases` (
  `id` VARCHAR(64) PRIMARY KEY,
  `reporterId` VARCHAR(255), `reporterName` VARCHAR(255), `reporterPhone` VARCHAR(255),
  `animal` VARCHAR(255), `title` VARCHAR(255), `needs` VARCHAR(255),
  `urgency` VARCHAR(255) COMMENT 'critical | urgent | moderate',
  `condition` LONGTEXT COMMENT 'JSON array', `description` LONGTEXT,
  `lat` DOUBLE, `lng` DOUBLE, `dLat` DOUBLE, `dLng` DOUBLE, `address` VARCHAR(1024),
  `media` LONGTEXT COMMENT 'JSON array of photo/video URLs', `createdAt` BIGINT,
  `status` VARCHAR(255) COMMENT 'reported | accepted | on_the_way | reached | treatment | resolved',
  `timeline` LONGTEXT COMMENT 'JSON array of {status, at, note, by}', `updates` LONGTEXT,
  `rescuerId` VARCHAR(255), `rescuerName` VARCHAR(255), `rescuerPhone` VARCHAR(255),
  `rescuerLoc` LONGTEXT COMMENT 'JSON {lat, lng, at}', `aiSummary` VARCHAR(1024),
  INDEX idx_case_status (`status`), INDEX idx_case_reporter (`reporterId`), INDEX idx_case_rescuer (`rescuerId`)
);

CREATE TABLE IF NOT EXISTS `pets` (
  `id` VARCHAR(64) PRIMARY KEY,
  `ownerId` VARCHAR(255), `name` VARCHAR(255), `species` VARCHAR(255), `breed` VARCHAR(255), `gender` VARCHAR(255),
  `dob` VARCHAR(255), `weight` VARCHAR(255), `color` VARCHAR(255), `photo` VARCHAR(512), `health` VARCHAR(255),
  `microchip` VARCHAR(255), `notes` LONGTEXT,
  `vaccinations` LONGTEXT COMMENT 'JSON array', `records` LONGTEXT COMMENT 'JSON array', `reminders` LONGTEXT COMMENT 'JSON array',
  INDEX idx_pet_owner (`ownerId`)
);

CREATE TABLE IF NOT EXISTS `appointments` (
  `id` VARCHAR(64) PRIMARY KEY,
  `ownerId` VARCHAR(255), `petId` VARCHAR(255), `vetId` VARCHAR(255), `vetName` VARCHAR(255),
  `mode` VARCHAR(255) COMMENT 'clinic | video | home', `date` VARCHAR(255), `time` VARCHAR(255),
  `reason` LONGTEXT, `file` VARCHAR(512), `status` VARCHAR(255), `createdAt` BIGINT
);

CREATE TABLE IF NOT EXISTS `chat_threads` (
  `id` VARCHAR(64) PRIMARY KEY,
  `members` LONGTEXT COMMENT 'JSON array of user ids', `caseId` VARCHAR(255), `title` VARCHAR(255), `avatar` VARCHAR(255),
  `msgs` LONGTEXT COMMENT 'JSON array of {from, text, media, at}', `read` LONGTEXT COMMENT 'JSON {userId: timestamp}'
);

CREATE TABLE IF NOT EXISTS `posts` (
  `id` VARCHAR(64) PRIMARY KEY,
  `author` VARCHAR(255), `authorId` VARCHAR(255), `text` LONGTEXT, `tag` VARCHAR(255), `image` VARCHAR(512),
  `at` BIGINT, `likes` INT, `comments` INT, `liked` BIT(1), `cmts` LONGTEXT COMMENT 'JSON array'
);

CREATE TABLE IF NOT EXISTS `activities` (
  `id` VARCHAR(64) PRIMARY KEY, `userId` VARCHAR(255), `text` VARCHAR(1024), `at` BIGINT, `icon` VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(64) PRIMARY KEY, `userId` VARCHAR(255), `text` VARCHAR(1024), `at` BIGINT, `read` BIT(1), `link` VARCHAR(255),
  INDEX idx_notif_user (`userId`)
);

CREATE TABLE IF NOT EXISTS `volunteer_signups` (
  `id` VARCHAR(64) PRIMARY KEY, `userId` VARCHAR(255), `oppId` VARCHAR(255), `at` BIGINT
);

CREATE TABLE IF NOT EXISTS `rescue_teams` (
  `id` VARCHAR(64) PRIMARY KEY, `name` VARCHAR(255), `area` VARCHAR(255), `members` INT, `phone` VARCHAR(255), `by` VARCHAR(255), `at` BIGINT
);

CREATE TABLE IF NOT EXISTS `app_meta` (
  `id` VARCHAR(64) PRIMARY KEY, `json` LONGTEXT
);
