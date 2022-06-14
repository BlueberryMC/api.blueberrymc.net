import { query } from '../index'

export default async () => {
  await query(`CREATE TABLE \`settings\` (
    \`key\` VARCHAR(255) NOT NULL,
    \`value\` VARCHAR(255) NOT NULL,
    PRIMARY KEY(\`key\`)
  )`)
  await query(`CREATE TABLE \`projects\` (
    \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`name\` VARCHAR(255) NOT NULL UNIQUE,
    \`description\` TEXT NOT NULL,
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`repo_url\` TEXT NOT NULL,
    PRIMARY KEY(\`id\`)
  )`)
  // stores version groups like major.minor
  await query(`CREATE TABLE \`version_groups\` (
    \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`project_id\` INT UNSIGNED NOT NULL,
    \`name\` VARCHAR(255) NOT NULL,
    \`description\` TEXT NOT NULL,
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`experimental\` TINYINT(1) NOT NULL DEFAULT 0,
    \`legacy\` TINYINT(1) NOT NULL DEFAULT 0,
    \`branch\` VARCHAR(255) NOT NULL,
    PRIMARY KEY(\`id\`),
    UNIQUE KEY \`project_id_name\` (\`project_id\`, \`name\`)
  )`)
  // stores versions like major.minor.patch
  await query(`CREATE TABLE \`versions\` (
    \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`version_group_id\` INT UNSIGNED NOT NULL,
    \`name\` VARCHAR(255) NOT NULL,
    PRIMARY KEY(\`id\`),
    UNIQUE KEY \`version_group_id_name\` (\`version_group_id\`, \`name\`)
  )`)
  // stores builds like major.minor.patch.build
  await query(`CREATE TABLE \`builds\` (
    \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`version_id\` BIGINT UNSIGNED NOT NULL,
    \`build_number\` INT UNSIGNED NOT NULL,
    \`experimental\` TINYINT(1) NOT NULL DEFAULT 0,
    \`promoted\` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY(\`id\`),
    UNIQUE KEY \`version_id_build_number\` (\`version_id\`, \`build_number\`)
  )`)
  await query(`CREATE TABLE \`build_files\` (
    \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`build_id\` BIGINT UNSIGNED NOT NULL,
    \`type\` VARCHAR(255) NOT NULL,
    \`download_url\` TEXT NOT NULL,
    PRIMARY KEY(\`id\`)
  )`)
  await query(`CREATE TABLE \`build_changes\` (
    \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`build_id\` BIGINT UNSIGNED NOT NULL,
    \`sha\` VARCHAR(255) NOT NULL,
    \`description\` TEXT NOT NULL,
    PRIMARY KEY(\`id\`)
  )`)
  await query('INSERT INTO `settings` (`key`, `value`) VALUES ("database_version", "1")')
}
