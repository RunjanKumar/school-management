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
		password: await Utils.hashPassword(schoolOwnerPassword)
	});

	return createSuccessResponse(Constants.RESPONSE_MESSAGES.SCHOOL_OWNER_CREATED, { schoolOwner });
}

async function loginSchoolOwner(payload: any) {
	const schoolOwner = await dbService.findOne(schoolOwnerModel, { email: payload.email });

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
	loginSchoolOwner
};
