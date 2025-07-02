import { Constants } from '../commons/constants';
import { schoolModel } from '../models';
import dbService from '../services/databaseService';
import { createErrorResponse, createSuccessResponse } from '../commons/responseHelpers';

/**
 * Creates a new school in the system
 * @param {Object} payload - Request payload containing school details
 * @param {string} payload.name - Name of the school
 * @param {string} payload.website - Website URL of the school
 * @param {string} payload.email - Email address of the school
 * @param {string} payload.contactNumber - Contact number of the school
 * @param {string} payload.address - Address of the school
 * @param {Object} payload.schoolOwner - School owner object containing _id
 * @param {string} payload.schoolOwner._id - ID of the school owner
 * @returns {Object} Success response with created school data
 * @throws {Object} Error response if school creation fails
 */
async function createSchool(payload: any) {
	const school = await dbService.create(schoolModel, {
		name: payload.name,
		website: payload.website,
		email: payload.email,
		contactNumber: payload.contactNumber,
		address: payload.address,
		schoolOwnerId: payload.schoolOwner._id
	});

	return createSuccessResponse(Constants.RESPONSE_MESSAGES.SCHOOL_CREATED, { school });
}

/**
 * Updates an existing school's information
 * @param {Object} payload - Request payload containing school update details
 * @param {string} payload.schoolId - ID of the school to update
 * @param {string} [payload.name] - Updated name of the school (optional)
 * @param {string} [payload.website] - Updated website URL of the school (optional)
 * @param {string} [payload.email] - Updated email address of the school (optional)
 * @param {string} [payload.contactNumber] - Updated contact number of the school (optional)
 * @param {string} [payload.address] - Updated address of the school (optional)
 * @returns {Object} Success response indicating school was updated
 * @throws {Object} Error response if school update fails or school not found
 */
async function updateSchool(payload: any) {
	await dbService.updateOne(
		schoolModel,
		{ _id: payload.schoolId },
		{
			$set: {
				...(payload.hasOwnProperty('name') && { name: payload.name }),
				...(payload.hasOwnProperty('website') && { website: payload.website }),
				...(payload.hasOwnProperty('email') && { email: payload.email }),
				...(payload.hasOwnProperty('contactNumber') && { contactNumber: payload.contactNumber }),
				...(payload.hasOwnProperty('address') && { address: payload.address })
			}
		}
	);

	return createSuccessResponse(Constants.RESPONSE_MESSAGES.SCHOOL_UPDATED);
}

/**
 * Retrieves a list of schools with pagination and search functionality
 * @param {Object} payload - Request payload containing search and pagination parameters
 * @param {string} [payload.searchString] - Search string to filter schools by name, email, or contact number (optional)
 * @param {string} payload.sortKey - Field name to sort by
 * @param {number} payload.sortOrder - Sort order (1 for ascending, -1 for descending)
 * @param {number} payload.skip - Number of records to skip for pagination
 * @param {number} payload.limit - Maximum number of records to return
 * @returns {Object} Success response with schools data and count
 * @returns {Array} returns.data - Array of school objects
 * @returns {number} returns.count - Total count of schools matching criteria
 * @throws {Object} Error response if schools retrieval fails
 */
async function getSchools(payload: any) {
	const matchCriteria: Record<string, boolean | Record<string, Record<string, string>>[]> = { isDeleted: false };

	if (payload.searchString) {
		matchCriteria.$or = [ { name: { $regex: payload.searchString, $options: 'i' } }, { email: { $regex: payload.searchString, $options: 'i' } }, { contactNumber: { $regex: payload.searchString, $options: 'i' } } ];
	}

	const schools = await dbService.aggregate(schoolModel, [
		{ $match: matchCriteria },
		{
			$facet: {
				data: [ { $sort: { [payload.sortKey]: payload.sortOrder } }, { $skip: payload.skip }, { $limit: payload.limit } ],
				count: [ { $count: 'count' } ]
			}
		},
		{ $addFields: { count: { $ifNull: [ { $first: '$count.count' }, 0 ] } } }
	]);

	return createSuccessResponse(Constants.RESPONSE_MESSAGES.SCHOOLS_FETCHED, {
		data: schools[0]?.data ?? [],
		count: schools[0]?.count ?? 0
	});
}

/**
 * Soft deletes one or more schools by setting isDeleted flag to true
 * @param {Object} payload - Request payload containing school deletion details
 * @param {Array<string>} payload.schoolIds - Array of school IDs to delete
 * @param {Object} payload.schoolOwner - School owner object containing _id
 * @param {string} payload.schoolOwner._id - ID of the school owner
 * @returns {Object} Success response indicating schools were deleted
 * @throws {Object} Error response if schools not found or deletion fails
 */
async function deleteSchools(payload: any) {
	const existingSchools = await dbService.count(schoolModel, {
		_id: { $in: payload.schoolIds },
		schoolOwnerId: payload.schoolOwner._id,
		isDeleted: false
	});

	if (existingSchools !== payload.schoolIds.length) {
		throw createErrorResponse(payload.schoolIds.length ? Constants.RESPONSE_MESSAGES.SCHOOLS_NOT_FOUND : Constants.RESPONSE_MESSAGES.SCHOOL_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	await dbService.updateMany(
		schoolModel,
		{
			_id: { $in: payload.schoolIds },
			schoolOwnerId: payload.schoolOwner._id
		},
		{ $set: { isDeleted: true } }
	);

	return createSuccessResponse(payload.schoolIds.length ? Constants.RESPONSE_MESSAGES.SCHOOLS_DELETED : Constants.RESPONSE_MESSAGES.SCHOOL_DELETED);
}

export const schoolController = {
	createSchool,
	updateSchool,
	getSchools,
	deleteSchools
};
