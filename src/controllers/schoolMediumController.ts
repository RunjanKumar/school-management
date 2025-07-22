import { createSuccessResponse, createErrorResponse } from '../commons/responseHelpers';
import { MESSAGES } from '../commons/message';
import { Constants } from '../commons/constants';
import { schoolMediumModel, schoolModel } from '../models';
import dbService from '../services/databaseService';
import { Types } from 'mongoose';

/**
 * Creates a new school medium
 * @param {Object} payload - Request payload containing school medium creation details
 * @param {string} payload.name - Name of the school medium
 * @returns {Object} Success response indicating school medium was created
 * @throws {Object} Error response if school medium creation fails or school medium already exists
 */
async function createSchoolMedium(payload: any) {
	const existingSchoolMedium = await dbService.findOne(schoolMediumModel, {
		name: payload.name,
		isDeleted: false
	});

	if (existingSchoolMedium) {
		throw createErrorResponse(MESSAGES.SCHOOL_MEDIUM_ALREADY_EXISTS, Constants.ERROR_TYPES.ALREADY_EXISTS);
	}

	const medium = await dbService.create(schoolMediumModel, { name: payload.name });

	return createSuccessResponse(MESSAGES.SCHOOL_MEDIUM_CREATED, { medium });
}

/**
 * Updates a school medium
 * @param {Object} payload - Request payload containing school medium update details
 * @param {string} payload.schoolMediumId - ID of the school medium to update
 * @param {string} payload.name - Updated name of the school medium
 * @returns {Object} Success response indicating school medium was updated
 * @throws {Object} Error response if school medium update fails or school medium not found
 */
async function updateSchoolMedium(payload: any) {
	const schoolMedium = await dbService.findOne(schoolMediumModel, {
		_id: payload.schoolMediumId,
		isDeleted: false
	});

	if (!schoolMedium) {
		throw createErrorResponse(MESSAGES.SCHOOL_MEDIUM_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	if (payload.name !== schoolMedium.name) {
		const existingSchoolMedium = await dbService.findOne(schoolMediumModel, {
			name: payload.name,
			isDeleted: false
		});

		if (existingSchoolMedium) {
			throw createErrorResponse(MESSAGES.SCHOOL_MEDIUM_ALREADY_EXISTS, Constants.ERROR_TYPES.ALREADY_EXISTS);
		}
	}

	await dbService.updateOne(schoolMediumModel, { _id: payload.schoolMediumId }, { $set: { name: payload.name } });

	return createSuccessResponse(MESSAGES.SCHOOL_MEDIUM_UPDATED);
}

/**
 * Retrieves a list of school mediums with pagination and search functionality
 * @param {Object} payload - Request payload containing search and pagination parameters
 * @param {string} payload.schoolMediumId - School medium ID to filter schools by (optional)
 * @param {string} [payload.searchString] - Search string; applies on name field
 * @param {string} payload.sortKey - Field name to sort by
 * @param {number} payload.sortDirection - Sort direction (1 for ascending, -1 for descending)
 * @param {number} payload.skip - Number of records to skip for pagination
 * @param {number} payload.limit - Maximum number of records to return
 * @returns {Object} Success response with school mediums data and count
 * @returns {Array} returns.data - Array of school mediums objects
 * @returns {number} returns.count - Total count of school mediums matching criteria
 * @throws {Object} Error response if school mediums retrieval fails
 */
async function getSchoolMediums(payload: any) {
	const matchCriteria: Record<string, boolean | Types.ObjectId | { $regex: string; $options: string }> = { isDeleted: false };

	if (payload.schoolMediumId) {
		matchCriteria._id = payload.schoolMediumId;
	}
	if (payload.searchString) {
		matchCriteria.name = { $regex: payload.searchString, $options: 'i' };
	}

	const data = await dbService.aggregate(schoolMediumModel, [
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

	return createSuccessResponse(MESSAGES.SCHOOL_MEDIUMS_FETCHED, {
		data: data[0]?.data ?? [],
		count: data[0]?.count ?? 0
	});
}

/**
 * Deletes a school medium
 * @param {Object} payload - Request payload containing school medium deletion details
 * @param {string[]} payload.schoolMediumIds - IDs of the school mediums to delete
 * @returns {Object} Success response indicating school medium was deleted
 * @throws {Object} Error response if school medium deletion fails or school medium not found
 */
async function deleteSchoolMedium(payload: any) {
	const schoolMediums = await dbService.count(schoolMediumModel, {
		_id: { $in: payload.schoolMediumIds },
		isDeleted: false
	});

	if (schoolMediums !== payload.schoolMediumIds.length) {
		throw createErrorResponse(payload.schoolMediumIds.length === 1 ? MESSAGES.SCHOOL_MEDIUM_NOT_FOUND : MESSAGES.SCHOOL_MEDIUMS_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	const assignedSchools = await dbService.count(schoolModel, {
		mediumOfInstruction: { $in: payload.schoolMediumIds },
		isDeleted: false
	});

	if (assignedSchools) {
		throw createErrorResponse(MESSAGES.SCHOOL_MEDIUM_IS_ASSOCIATED_WITH_SCHOOLS, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	await dbService.updateMany(schoolMediumModel, { _id: { $in: payload.schoolMediumIds } }, { isDeleted: true });

	return createSuccessResponse(payload.schoolMediumIds.length === 1 ? MESSAGES.SCHOOL_MEDIUM_DELETED : MESSAGES.SCHOOL_MEDIUMS_DELETED);
}

export const schoolMediumController = {
	createSchoolMedium,
	getSchoolMediums,
	updateSchoolMedium,
	deleteSchoolMedium
};
