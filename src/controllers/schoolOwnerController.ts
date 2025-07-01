import { createSuccessResponse, createErrorResponse } from '../commons/responseHelpers';
import dbService from '../services/databaseService';
import { schoolOwnerModel } from '../models';
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

export const schoolOwnerController = {
	createSchoolOwner
};
