import { createSuccessResponse, createErrorResponse } from '../commons/responseHelpers';
import dbService from '../services/databaseService';
import { schoolOwnerModel, sessionModel } from '../models';
import { Constants } from '../commons/constants';
import { Utils } from '../utils/utils';

/**
 * Creates a new school owner in the system
 * @param {Object} payload - Request payload containing school owner details
 * @param {string} payload.name - Full name of the school owner
 * @param {string} payload.email - Email address of the school owner (must be unique)
 * @param {string} payload.contactNumber - Primary contact number of the school owner (must be unique)
 * @param {string} [payload.alternateContactNumber] - Alternate contact number of the school owner (optional, must be unique)
 * @param {boolean} [payload.isEnabled] - Whether the school owner account is enabled (optional, defaults to true)
 * @returns {Object} Success response with created school owner data
 * @throws {Object} Error response if email or contact number already exists
 */
async function createSchoolOwner(payload: any) {
	// check that both email and phoine number are unique
	const schoolOwnerWithDuplicateEmail = await dbService.findOne(schoolOwnerModel, {
		email: payload.email
	});

	if (schoolOwnerWithDuplicateEmail) {
		throw createErrorResponse(Constants.RESPONSE_MESSAGES.SCHOOL_OWNER_EMAIL_ALREADY_EXISTS, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	const schoolOwnerWithDuplicatePhoneNumber = await dbService.findOne(schoolOwnerModel, { $or: [ { contactNumber: payload.contactNumber }, { alternateContactNumber: payload.alternateContactNumber } ] });

	if (schoolOwnerWithDuplicatePhoneNumber) {
		throw createErrorResponse(Constants.RESPONSE_MESSAGES.SCHOOL_OWNER_CONTACT_NUMBER_ALREADY_EXISTS, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	const schoolOwnerPassword = Utils.generateRandomPassword();

	const schoolOwner = await dbService.create(schoolOwnerModel, {
		name: payload.name,
		email: payload.email,
		contactNumber: payload.contactNumber,
		alternateContactNumber: payload.alternateContactNumber,
		password: await Utils.hashPassword(schoolOwnerPassword),
		isEnabled: payload.isEnabled
	});

	return createSuccessResponse(Constants.RESPONSE_MESSAGES.SCHOOL_OWNER_CREATED, { schoolOwner });
}

/**
 * Updates an existing school owner's information
 * @param {Object} payload - Request payload containing school owner update details
 * @param {string} payload.schoolOwnerId - ID of the school owner to update
 * @param {string} [payload.name] - Updated name of the school owner (optional)
 * @param {string} [payload.email] - Updated email address of the school owner (optional, must be unique)
 * @param {string} [payload.contactNumber] - Updated primary contact number (optional, must be unique)
 * @param {string} [payload.alternateContactNumber] - Updated alternate contact number (optional, must be unique)
 * @param {boolean} [payload.isEnabled] - Updated enabled status (optional)
 * @returns {Object} Success response indicating school owner was updated
 * @throws {Object} Error response if school owner not found or duplicate email/contact number
 */
async function updateSchoolOwner(payload: any) {
	const schoolOwner = await dbService.findOne(schoolOwnerModel, { _id: payload.schoolOwnerId });

	if (!schoolOwner) {
		throw createErrorResponse(Constants.RESPONSE_MESSAGES.SCHOOL_OWNER_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	if (payload.email && payload.email !== schoolOwner.email) {
		const schoolOwnerWithDuplicateEmail = await dbService.findOne(schoolOwnerModel, { email: payload.email });

		if (schoolOwnerWithDuplicateEmail) {
			throw createErrorResponse(Constants.RESPONSE_MESSAGES.SCHOOL_OWNER_EMAIL_ALREADY_EXISTS, Constants.ERROR_TYPES.BAD_REQUEST);
		}
	}

	if (payload.contactNumber && payload.contactNumber !== schoolOwner.contactNumber) {
		const schoolOwnerWithDuplicatePhoneNumber = await dbService.findOne(schoolOwnerModel, { contactNumber: payload.contactNumber });

		if (schoolOwnerWithDuplicatePhoneNumber) {
			throw createErrorResponse(Constants.RESPONSE_MESSAGES.SCHOOL_OWNER_CONTACT_NUMBER_ALREADY_EXISTS, Constants.ERROR_TYPES.BAD_REQUEST);
		}
	}

	if (payload.alternateContactNumber && payload.alternateContactNumber !== schoolOwner.alternateContactNumber) {
		const schoolOwnerWithDuplicateAlternatePhoneNumber = await dbService.findOne(schoolOwnerModel, { alternateContactNumber: payload.alternateContactNumber });

		if (schoolOwnerWithDuplicateAlternatePhoneNumber) {
			throw createErrorResponse(Constants.RESPONSE_MESSAGES.SCHOOL_OWNER_CONTACT_NUMBER_ALREADY_EXISTS, Constants.ERROR_TYPES.BAD_REQUEST);
		}
	}

	await dbService.updateOne(
		schoolOwnerModel,
		{ _id: payload.schoolOwnerId },
		{
			$set: {
				...(payload.hasOwnProperty('name') && { name: payload.name }),
				...(payload.hasOwnProperty('email') && { email: payload.email }),
				...(payload.hasOwnProperty('contactNumber') && { contactNumber: payload.contactNumber }),
				...(payload.hasOwnProperty('alternateContactNumber') && { alternateContactNumber: payload.alternateContactNumber }),
				...(payload.hasOwnProperty('isEnabled') && { isEnabled: payload.isEnabled })
			}
		}
	);

	return createSuccessResponse(Constants.RESPONSE_MESSAGES.SCHOOL_OWNER_UPDATED);
}

/**
 * Retrieves a list of school owners with pagination and search functionality
 * @param {Object} payload - Request payload containing search and pagination parameters
 * @param {string} [payload.searchString] - Search string to filter school owners by name, email, or contact number (optional)
 * @param {string} payload.sortKey - Field name to sort by
 * @param {number} payload.sortDirection - Sort direction (1 for ascending, -1 for descending)
 * @param {number} payload.skip - Number of records to skip for pagination
 * @param {number} payload.limit - Maximum number of records to return
 * @returns {Object} Success response with school owners data and count
 * @returns {Array} returns.data - Array of school owner objects (limited fields)
 * @returns {number} returns.count - Total count of school owners matching criteria
 * @throws {Object} Error response if school owners retrieval fails
 */
async function listSchoolOwners(payload: any) {
	const matchCriteria: Record<string, boolean | Record<string, Record<string, string>>[]> = { isDeleted: false };

	if (payload.searchString) {
		matchCriteria.$or = [ { name: { $regex: payload.searchString, $options: 'i' } }, { email: { $regex: payload.searchString, $options: 'i' } }, { contactNumber: { $regex: payload.searchString, $options: 'i' } } ];
	}

	const schoolOwners = await dbService.aggregate(schoolOwnerModel, [
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
							email: 1,
							contactNumber: 1,
							isEnabled: 1,
							createdAt: 1
						}
					}
				],
				count: [ { $count: 'count' } ]
			}
		},
		{ $addFields: { count: { $ifNull: [ { $first: '$count.count' }, 0 ] } } }
	]);

	return createSuccessResponse(Constants.RESPONSE_MESSAGES.SCHOOL_OWNERS_LISTED, {
		data: schoolOwners[0]?.data ?? [],
		count: schoolOwners[0]?.count ?? 0
	});
}

/**
 * Fetches detailed information of a specific school owner
 * @param {Object} payload - Request payload containing school owner ID
 * @param {string} payload.schoolOwnerId - ID of the school owner to fetch details for
 * @returns {Object} Success response with school owner details
 * @returns {Object} returns.schoolOwner - School owner object with detailed information
 * @throws {Object} Error response if school owner not found
 */
async function fetchSchoolOwnerDetails(payload: any) {
	const schoolOwner = await dbService.findOne(
		schoolOwnerModel,
		{ _id: payload.schoolOwnerId },
		{
			_id: 1,
			name: 1,
			email: 1,
			contactNumber: 1,
			alternateContactNumber: 1,
			createdAt: 1,
			isEnabled: 1
		}
	);

	if (!schoolOwner) {
		throw createErrorResponse(Constants.RESPONSE_MESSAGES.SCHOOL_OWNER_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	return createSuccessResponse(Constants.RESPONSE_MESSAGES.SCHOOL_OWNER_DETAILS_FETCHED, { schoolOwner });
}

/**
 * Soft deletes one or more school owners by setting isDeleted flag to true
 * @param {Object} payload - Request payload containing school owner deletion details
 * @param {Array<string>} payload.schoolOwnerIds - Array of school owner IDs to delete
 * @returns {Object} Success response indicating school owners were deleted
 * @throws {Object} Error response if school owners not found or deletion fails
 */
async function deleteSchoolOwners(payload: any) {
	const existingSchoolOwners = await dbService.count(schoolOwnerModel, {
		_id: { $in: payload.schoolOwnerIds },
		isDeleted: false
	});

	if (existingSchoolOwners !== payload.schoolOwnerIds.length) {
		throw createErrorResponse(payload.schoolOwnerIds.length === 1 ? Constants.RESPONSE_MESSAGES.SCHOOL_OWNER_NOT_FOUND : Constants.RESPONSE_MESSAGES.SCHOOL_OWNERS_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	await dbService.updateMany(schoolOwnerModel, { _id: { $in: payload.schoolOwnerIds } }, { $set: { isDeleted: true } });

	return createSuccessResponse(payload.schoolOwnerIds.length === 1 ? Constants.RESPONSE_MESSAGES.SCHOOL_OWNER_DELETED : Constants.RESPONSE_MESSAGES.SCHOOL_OWNERS_DELETED);
}

/**
 * Authenticates a school owner and creates a login session
 * @param {Object} payload - Request payload containing login credentials
 * @param {string} payload.email - Email address of the school owner
 * @param {string} payload.password - Password of the school owner
 * @returns {Object} Success response with authentication token
 * @returns {string} returns.token - JWT token for authentication
 * @throws {Object} Error response if invalid credentials or account disabled
 */
async function loginSchoolOwner(payload: any) {
	const schoolOwner = await dbService.findOne(schoolOwnerModel, {
		email: payload.email,
		isEnabled: true,
		isDeleted: false
	});

	if (!schoolOwner) {
		throw createErrorResponse(Constants.RESPONSE_MESSAGES.SCHOOL_OWNER_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	const isPasswordValid = await Utils.comparePassword(payload.password, schoolOwner.password);

	if (!isPasswordValid) {
		throw createErrorResponse(Constants.RESPONSE_MESSAGES.SCHOOL_OWNER_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	// generate token
	const token = Utils.generateJWTToken(schoolOwner._id.toString(), Constants.TOKEN_EXPIRATION_TIME.SCHOOL_OWNER_LOGIN);

	// create session
	await dbService.create(sessionModel, {
		userId: schoolOwner._id,
		refPath: Constants.SESSIONS_REF_PATH.SCHOOL_OWNER,
		type: Constants.SESSION.LOGIN,
		token: token.token,
		expirationTime: new Date(Date.now() + Constants.TOKEN_EXPIRATION_TIME.SCHOOL_OWNER_LOGIN * 1000)
	});

	return createSuccessResponse(Constants.RESPONSE_MESSAGES.LOGIN_SUCCESSFUL, { token: token.token });
}

/**
 * Changes the password for a school owner account
 * @param {Object} payload - Request payload containing password change details
 * @param {Object} payload.schoolOwner - School owner object containing _id and password
 * @param {string} payload.schoolOwner._id - ID of the school owner
 * @param {string} payload.schoolOwner.password - Current hashed password
 * @param {string} payload.password - Current password (plain text)
 * @param {string} payload.newPassword - New password to set (plain text)
 * @returns {Object} Success response indicating password was changed
 * @throws {Object} Error response if current password is incorrect
 */
async function changePassword(payload: any) {
	// check if current password is correct
	const isPasswordValid = await Utils.comparePassword(payload.password, payload.schoolOwner.password);

	if (!isPasswordValid) {
		throw createErrorResponse(Constants.RESPONSE_MESSAGES.INVALID_PASSWORD, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	await dbService.updateOne(
		schoolOwnerModel,
		{ _id: payload.schoolOwner._id },
		{
			$set: {
				password: await Utils.hashPassword(payload.newPassword),
				hasSetPassword: true
			}
		}
	);

	return createSuccessResponse(Constants.RESPONSE_MESSAGES.PASSWORD_CHANGED);
}

/**
 * Updates the account details (name) of a school owner
 * @param {Object} payload - Request payload containing account update details
 * @param {Object} payload.schoolOwner - School owner object containing _id
 * @param {string} payload.schoolOwner._id - ID of the school owner
 * @param {string} payload.name - Updated name of the school owner
 * @returns {Object} Success response indicating account details were updated
 * @throws {Object} Error response if account update fails
 */
async function updateAccountDetails(payload: any) {
	await dbService.updateOne(schoolOwnerModel, { _id: payload.schoolOwner._id }, { $set: { name: payload.name } });

	return createSuccessResponse(Constants.RESPONSE_MESSAGES.ACCOUNT_DETAILS_UPDATED);
}

/**
 * Retrieves the profile information of the authenticated school owner
 * @param {Object} payload - Request payload containing school owner data
 * @param {Object} payload.schoolOwner - School owner object containing profile information
 * @param {string} payload.schoolOwner._id - ID of the school owner
 * @param {string} payload.schoolOwner.name - Name of the school owner
 * @param {string} payload.schoolOwner.email - Email address of the school owner
 * @param {string} payload.schoolOwner.contactNumber - Contact number of the school owner
 * @param {string} [payload.schoolOwner.alternateContactNumber] - Alternate contact number of the school owner
 * @returns {Object} Success response with school owner profile data
 * @returns {Object} returns.schoolOwner - School owner profile object
 * @throws {Object} Error response if profile retrieval fails
 */
async function getProfile(payload: any) {
	return createSuccessResponse(Constants.RESPONSE_MESSAGES.PROFILE_DETAILS_FETCHED, {
		schoolOwner: {
			_id: payload.schoolOwner._id,
			name: payload.schoolOwner.name,
			email: payload.schoolOwner.email,
			contactNumber: payload.schoolOwner.contactNumber,
			alternateContactNumber: payload.schoolOwner.alternateContactNumber
		}
	});
}

export const schoolOwnerController = {
	createSchoolOwner,
	updateSchoolOwner,
	listSchoolOwners,
	fetchSchoolOwnerDetails,
	deleteSchoolOwners,
	loginSchoolOwner,
	changePassword,
	updateAccountDetails,
	getProfile
};
