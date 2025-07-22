import { Constants } from '../commons/constants';
import { MESSAGES } from '../commons/message';
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
	console.log(payload.schoolOwner._id, 'Creating school with payload:');
	const schoolData = {
		name: payload.name,
		shortName: payload.shortName,
		logo: payload.logo,
		description: payload.description,
		establishedYear: payload.establishedYear,
		email: payload.email,
		contactNumber: payload.contactNumber,
		website: payload.website,
		address: payload.address,
		affiliation: payload.affiliation,
		board: payload.board,
		mediumOfInstruction: payload.mediumOfInstruction,
		schoolType: payload.schoolType,
		educationalLevels: payload.educationalLevels,
		bannerImages: payload.bannerImages,
		schoolOwnerId: payload.schoolOwner._id
	};
	console.log('Creating school with data:', schoolData);
	const school = await dbService.create(schoolModel, schoolData);

	return createSuccessResponse(MESSAGES.SCHOOL_CREATED, { school });
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
	// Step 1: Check if the school exists
	const existingSchool = await dbService.findOne(schoolModel, { _id: payload.schoolId });
	if (!existingSchool) {
		throw createErrorResponse(MESSAGES.SCHOOL_NOT_FOUND, Constants.ERROR_TYPES.DATA_NOT_FOUND);
	}

	// Step 2: Build update data object
	const updateToData: any = {};

	if (payload.hasOwnProperty('name')) updateToData.name = payload.name;
	if (payload.hasOwnProperty('shortName')) updateToData.shortName = payload.shortName;
	if (payload.hasOwnProperty('logo')) updateToData.logo = payload.logo;
	if (payload.hasOwnProperty('description')) updateToData.description = payload.description;
	if (payload.hasOwnProperty('establishedYear')) updateToData.establishedYear = payload.establishedYear;
	if (payload.hasOwnProperty('email')) updateToData.email = payload.email;
	if (payload.hasOwnProperty('contactNumber')) updateToData.contactNumber = payload.contactNumber;
	if (payload.hasOwnProperty('website')) updateToData.website = payload.website;
	if (payload.hasOwnProperty('address')) updateToData.address = payload.address;
	if (payload.hasOwnProperty('affiliation')) updateToData.affiliation = payload.affiliation;
	if (payload.hasOwnProperty('board')) updateToData.board = payload.board;
	if (payload.hasOwnProperty('mediumOfInstruction')) updateToData.mediumOfInstruction = payload.mediumOfInstruction;
	if (payload.hasOwnProperty('schoolType')) updateToData.schoolType = payload.schoolType;
	if (payload.hasOwnProperty('educationalLevels')) updateToData.educationalLevels = payload.educationalLevels;
	if (payload.hasOwnProperty('bannerImages')) updateToData.bannerImages = payload.bannerImages;
	console.log('Update data for school:', updateToData);
	// Step 3: Perform the update
	await dbService.updateOne(schoolModel, { _id: payload.schoolId }, { $set: updateToData });

	return createSuccessResponse(MESSAGES.SCHOOL_UPDATED);
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
		{ $addFields: { studentsCount: 550, staffCount: 85, monthlyCost: 55000 } },
		{
			$facet: {
				data: [ { $sort: { [payload.sortKey]: payload.sortOrder } }, { $skip: payload.skip }, { $limit: payload.limit } ],
				count: [ { $count: 'count' } ]
			}
		},
		{ $addFields: { count: { $ifNull: [ { $first: '$count.count' }, 0 ] } } }
	]);

	return createSuccessResponse(MESSAGES.SCHOOLS_FETCHED, {
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
		throw createErrorResponse(payload.schoolIds.length > 1 ? MESSAGES.SCHOOLS_NOT_FOUND : MESSAGES.SCHOOL_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	await dbService.updateMany(
		schoolModel,
		{
			_id: { $in: payload.schoolIds },
			schoolOwnerId: payload.schoolOwner._id
		},
		{ $set: { isDeleted: true } }
	);

	return createSuccessResponse(payload.schoolIds.length > 1 ? MESSAGES.SCHOOLS_DELETED : MESSAGES.SCHOOL_DELETED);
}

export const schoolController = {
	createSchool,
	updateSchool,
	getSchools,
	deleteSchools
};
