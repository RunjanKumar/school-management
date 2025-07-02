import { createSuccessResponse, createErrorResponse } from '../commons/responseHelpers';
import dbService from '../services/databaseService';
import { schoolOwnerModel, sessionModel } from '../models';
import { Constants } from '../commons/constants';
import { Utils } from '../utils/utils';

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
				...(payload.name && { name: payload.name }),
				...(payload.email && { email: payload.email }),
				...(payload.contactNumber && { contactNumber: payload.contactNumber }),
				...(payload.alternateContactNumber && { alternateContactNumber: payload.alternateContactNumber }),
				...(payload.isEnabled !== undefined && { isEnabled: payload.isEnabled })
			}
		}
	);

	return createSuccessResponse(Constants.RESPONSE_MESSAGES.SCHOOL_OWNER_UPDATED);
}

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

export const schoolOwnerController = {
	createSchoolOwner,
	updateSchoolOwner,
	listSchoolOwners,
	fetchSchoolOwnerDetails,
	loginSchoolOwner
};
