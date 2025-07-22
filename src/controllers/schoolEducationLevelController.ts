import { createSuccessResponse, createErrorResponse } from '../commons/responseHelpers';
import { MESSAGES } from '../commons/message';
import { Constants } from '../commons/constants';
import { schoolEducationLevelModel, schoolModel } from '../models';
import dbService from '../services/databaseService';
import { Types } from 'mongoose';

/**
 * Creates a new school education level
 * @param {Object} payload - Request payload containing school education level creation details
 * @param {string} payload.name - Name of the school education level
 * @returns {Object} Success response indicating school education level was created
 * @throws {Object} Error response if creation fails or already exists
 */
async function createSchoolEducationLevel(payload: any) {
	const existingSchoolEducationLevel = await dbService.findOne(schoolEducationLevelModel, {
		name: payload.name,
		isDeleted: false
	});

	if (existingSchoolEducationLevel) {
		throw createErrorResponse(MESSAGES.SCHOOL_EDUCATION_LEVEL_ALREADY_EXISTS, Constants.ERROR_TYPES.ALREADY_EXISTS);
	}

	const schoolEducationLevel = await dbService.create(schoolEducationLevelModel, { name: payload.name });

	return createSuccessResponse(MESSAGES.SCHOOL_EDUCATION_LEVEL_CREATED, { schoolEducationLevel });
}

/**
 * Updates a school education level
 * @param {Object} payload - Request payload containing update details
 * @param {string} payload.schoolEducationLevelId - ID of the school education level to update
 * @param {string} payload.name - Updated name
 * @returns {Object} Success response indicating update
 * @throws {Object} Error response if update fails or not found
 */
async function updateSchoolEducationLevel(payload: any) {
	const schoolEducationLevel = await dbService.findOne(schoolEducationLevelModel, {
		_id: payload.schoolEducationLevelId,
		isDeleted: false
	});

	if (!schoolEducationLevel) {
		throw createErrorResponse(MESSAGES.SCHOOL_EDUCATION_LEVEL_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	if (payload.name !== schoolEducationLevel.name) {
		const existingSchoolEducationLevel = await dbService.findOne(schoolEducationLevelModel, {
			name: payload.name,
			isDeleted: false
		});

		if (existingSchoolEducationLevel) {
			throw createErrorResponse(MESSAGES.SCHOOL_EDUCATION_LEVEL_ALREADY_EXISTS, Constants.ERROR_TYPES.ALREADY_EXISTS);
		}
	}

	await dbService.updateOne(schoolEducationLevelModel, { _id: payload.schoolEducationLevelId }, { $set: { name: payload.name } });

	return createSuccessResponse(MESSAGES.SCHOOL_EDUCATION_LEVEL_UPDATED);
}

/**
 * Retrieves a list of school education levels with pagination and search functionality
 * @param {Object} payload - Request payload containing search and pagination parameters
 * @param {string} payload.schoolEducationLevelId - ID to filter by (optional)
 * @param {string} [payload.searchString] - Search string; applies on name field
 * @param {string} payload.sortKey - Field name to sort by
 * @param {number} payload.sortDirection - Sort direction (1 for ascending, -1 for descending)
 * @param {number} payload.skip - Number of records to skip for pagination
 * @param {number} payload.limit - Maximum number of records to return
 * @returns {Object} Success response with data and count
 * @throws {Object} Error response if retrieval fails
 */
async function getSchoolEducationLevels(payload: any) {
	const matchCriteria: Record<string, boolean | Types.ObjectId | { $regex: string; $options: string }> = { isDeleted: false };

	if (payload.schoolEducationLevelId) {
		matchCriteria._id = payload.schoolEducationLevelId;
	}

	if (payload.searchString) {
		matchCriteria.name = { $regex: payload.searchString, $options: 'i' };
	}

	const data = await dbService.aggregate(schoolEducationLevelModel, [
		{ $match: matchCriteria },
		{
			$facet: {
				data: [
					{ $sort: { [payload.sortKey]: payload.sortDirection } },
					{ $skip: payload.skip },
					{ $limit: payload.limit },
					{
						$project: {
							_id: 1,
							name: 1,
							createdAt: 1
						}
					}
				],
				count: [ { $count: 'count' } ]
			}
		},
		{ $addFields: { count: { $ifNull: [ { $first: '$count.count' }, 0 ] } } }
	]);

	return createSuccessResponse(MESSAGES.SCHOOL_EDUCATION_LEVELS_FETCHED, {
		data: data[0]?.data ?? [],
		count: data[0]?.count ?? 0
	});
}

/**
 * Deletes a school education level
 * @param {Object} payload - Request payload containing deletion details
 * @param {string[]} payload.schoolEducationLevelIds - IDs to delete
 * @returns {Object} Success response indicating deletion
 * @throws {Object} Error response if deletion fails or not found
 */
async function deleteSchoolEducationLevel(payload: any) {
	const educationLevels = await dbService.count(schoolEducationLevelModel, {
		_id: { $in: payload.schoolEducationLevelIds },
		isDeleted: false
	});

	if (educationLevels !== payload.schoolEducationLevelIds.length) {
		throw createErrorResponse(payload.schoolEducationLevelIds.length === 1 ? MESSAGES.SCHOOL_EDUCATION_LEVEL_NOT_FOUND : MESSAGES.SCHOOL_EDUCATION_LEVELS_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	const assignedSchools = await dbService.count(schoolModel, {
		educationalLevels: { $in: payload.schoolEducationLevelIds },
		isDeleted: false
	});

	if (assignedSchools) {
		throw createErrorResponse(MESSAGES.SCHOOL_EDUCATION_LEVEL_IS_ASSOCIATED_WITH_SCHOOLS, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	await dbService.updateMany(schoolEducationLevelModel, { _id: { $in: payload.schoolEducationLevelIds } }, { isDeleted: true });

	return createSuccessResponse(payload.schoolEducationLevelIds.length === 1 ? MESSAGES.SCHOOL_EDUCATION_LEVEL_DELETED : MESSAGES.SCHOOL_EDUCATION_LEVELS_DELETED);
}

export const schoolEducationLevelController = {
	createSchoolEducationLevel,
	getSchoolEducationLevels,
	updateSchoolEducationLevel,
	deleteSchoolEducationLevel
};
