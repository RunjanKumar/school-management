import { Constants } from '../commons/constants';
import CONFIG from '../config';
import * as Models from '../models';
import { Utils } from '../utils/utils';
import fs from 'fs';
import path from 'path';

/**
 * Run migrations.
 */
export default async function runMigrations() {
	let dbVersion = (await Models.dbVersionModel.findOne({}))?.version ?? 0;

	if (!dbVersion) {
		await Models.adminModel.create({
			name: CONFIG.ADMIN_CRED.NAME,
			email: CONFIG.ADMIN_CRED.EMAIL,
			password: await Utils.hashPassword(CONFIG.ADMIN_CRED.PASSWORD)
		});

		await Models.dbVersionModel.create({
			version: Constants.DATABASE_VERSIONS.ONE
		});

		dbVersion = Constants.DATABASE_VERSIONS.ONE;
	}

	if (dbVersion < Constants.DATABASE_VERSIONS.TWO) {
		addInitialData();

		await Models.dbVersionModel.updateOne({}, { $set: { version: Constants.DATABASE_VERSIONS.TWO } });
		dbVersion = Constants.DATABASE_VERSIONS.TWO;
	}
}

async function addInitialData() {
	const dataDir = path.join(__dirname, '../data');

	// School Boards
	const schoolBoardsPath = path.join(dataDir, 'schoolBoards.json');
	if (fs.existsSync(schoolBoardsPath)) {
		const schoolBoards = JSON.parse(fs.readFileSync(schoolBoardsPath, 'utf-8'));
		await Models.schoolBoardModel.insertMany(schoolBoards);
	}

	// School Education Levels
	const educationLevelsPath = path.join(dataDir, 'schoolEducationLevels.json');
	if (fs.existsSync(educationLevelsPath)) {
		const educationLevels = JSON.parse(fs.readFileSync(educationLevelsPath, 'utf-8'));
		await Models.schoolEducationLevelModel.insertMany(educationLevels);
	}

	// School Mediums
	const mediumsPath = path.join(dataDir, 'schoolMediums.json');
	if (fs.existsSync(mediumsPath)) {
		const mediums = JSON.parse(fs.readFileSync(mediumsPath, 'utf-8'));
		await Models.schoolMediumModel.insertMany(mediums);
	}
}
