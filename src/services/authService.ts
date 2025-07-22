import { Response, NextFunction } from 'express';
import { AuthenticatedRequestInterface } from '../interfaces';
import { createErrorResponse } from '../commons/responseHelpers';
import { Constants } from '../commons/constants';
import { Utils } from '../utils/utils';
import dbService from './databaseService';
import * as Models from '../models';
import { MESSAGES } from '../commons/message';

const authService: any = {};

/**
 * Validate auth
 * @param {number} auth - Auth type
 * @returns {Promise<boolean>} - True if auth is valid, false otherwise
 */
authService.validateAuth = (auth: number, allowWithoutSetPassword: boolean = false) => {
	switch (auth) {
	case Constants.AVAILABLE_AUTHS.ADMIN:
		return authService.adminValidate();
	case Constants.AVAILABLE_AUTHS.ADMIN_FORGOT_PASSWORD:
		return authService.adminForgotPasswordValidate();
	case Constants.AVAILABLE_AUTHS.SCHOOL_OWNER:
		return authService.schoolOwnerValidate(allowWithoutSetPassword);
	case Constants.AVAILABLE_AUTHS.SCHOOL_OWNER_FORGOT_PASSWORD:
		return authService.schoolOwnerForgotPasswordValidate();
	default:
		return (request: AuthenticatedRequestInterface, response: Response, next: NextFunction) => {
			next();
		};
	}
};

/**
 * Validate admin
 * @param {AuthenticatedRequestInterface} request - Request object
 * @returns {Promise<boolean>} - True if admin is valid, false otherwise
 */
authService.adminValidate = () => {
	return (request: AuthenticatedRequestInterface, response: Response, next: NextFunction) => {
		validateAdmin(request)
			.then((result) => {
				if (result) {
					return next();
				}

				const responseObject = createErrorResponse(MESSAGES.UNAUTHORIZED, Constants.ERROR_TYPES.UNAUTHORIZED);
				return response.status(responseObject.statusCode).json(responseObject);
			})
			.catch(() => {
				const responseObject = createErrorResponse(MESSAGES.UNAUTHORIZED, Constants.ERROR_TYPES.UNAUTHORIZED);
				return response.status(responseObject.statusCode).json(responseObject);
			});
	};
};

/**
 * Validate admin forgot password
 * @param {AuthenticatedRequestInterface} request - Request object
 * @returns {Promise<boolean>} - True if admin is valid, false otherwise
 */
authService.adminForgotPasswordValidate = () => {
	return (request: AuthenticatedRequestInterface, response: Response, next: NextFunction) => {
		validateAdminForgotPassword(request)
			.then((result) => {
				if (result) {
					return next();
				}

				const responseObject = createErrorResponse(MESSAGES.UNAUTHORIZED, Constants.ERROR_TYPES.UNAUTHORIZED);
				return response.status(responseObject.statusCode).json(responseObject);
			})
			.catch(() => {
				const responseObject = createErrorResponse(MESSAGES.UNAUTHORIZED, Constants.ERROR_TYPES.UNAUTHORIZED);
				return response.status(responseObject.statusCode).json(responseObject);
			});
	};
};

/**
 * Validate school owner
 * @param {AuthenticatedRequestInterface} request - Request object
 * @returns {Promise<boolean>} - True if school owner is valid, false otherwise
 */
authService.schoolOwnerValidate = (allowWithoutSetPassword: boolean = false) => {
	return (request: AuthenticatedRequestInterface, response: Response, next: NextFunction) => {
		validateSchoolOwner(request)
			.then((result) => {
				if (result) {
					return next();
				}

				const responseObject = createErrorResponse(MESSAGES.UNAUTHORIZED, Constants.ERROR_TYPES.UNAUTHORIZED);
				return response.status(responseObject.statusCode).json(responseObject);
			})
			.catch(() => {
				const responseObject = createErrorResponse(MESSAGES.UNAUTHORIZED, Constants.ERROR_TYPES.UNAUTHORIZED);
				return response.status(responseObject.statusCode).json(responseObject);
			});
	};
};

/**
 * Validate school owner forgot password
 * @param {AuthenticatedRequestInterface} request - Request object
 * @returns {Promise<boolean>} - True if school owner is valid, false otherwise
 */
authService.schoolOwnerForgotPasswordValidate = () => {
	return (request: AuthenticatedRequestInterface, response: Response, next: NextFunction) => {
		validateSchoolOwnerForgotPassword(request)
			.then((result) => {
				if (result) {
					return next();
				}

				const responseObject = createErrorResponse(MESSAGES.UNAUTHORIZED, Constants.ERROR_TYPES.UNAUTHORIZED);
				return response.status(responseObject.statusCode).json(responseObject);
			})
			.catch(() => {
				const responseObject = createErrorResponse(MESSAGES.UNAUTHORIZED, Constants.ERROR_TYPES.UNAUTHORIZED);
				return response.status(responseObject.statusCode).json(responseObject);
			});
	};
};

/**
 * Validate admin
 * @param {AuthenticatedRequestInterface} request - Request object
 * @returns {Promise<boolean>} - True if admin is valid, false otherwise
 */
const validateAdmin = async (request: AuthenticatedRequestInterface) => {
	const token = request.headers.authorization;

	if (!token) {
		return false;
	}

	const decoded = Utils.decryptJWTToken(token);

	if (!decoded) {
		return false;
	}

	const session = await dbService.findOne(Models.sessionModel, {
		token: token,
		refPath: Constants.SESSIONS_REF_PATH.ADMIN,
		type: Constants.SESSION.LOGIN,
		expirationTime: { $gt: new Date() }
	});

	if (!session) {
		return false;
	}

	const admin = await dbService.findOne(Models.adminModel, {
		_id: decoded.id,
		isDeleted: false
	});

	if (!admin) {
		return false;
	}

	request.admin = admin;
	return true;
};

/**
 * Validate admin forgot password
 * @param {AuthenticatedRequestInterface} request - Request object
 * @returns {Promise<boolean>} - True if admin is valid, false otherwise
 */
const validateAdminForgotPassword = async (request: AuthenticatedRequestInterface) => {
	const token = request.headers.authorization;

	if (!token) {
		return false;
	}

	const decoded = Utils.decryptJWTToken(token);

	if (!decoded) {
		return false;
	}

	const session = await dbService.findOne(Models.sessionModel, {
		token: token,
		refPath: Constants.SESSIONS_REF_PATH.ADMIN,
		type: Constants.SESSION.FORGOT_PASSWORD,
		expirationTime: { $gt: new Date() }
	});

	if (!session) {
		return false;
	}

	const admin = await dbService.findOne(Models.adminModel, {
		_id: session.userId,
		isDeleted: false
	});

	if (!admin) {
		return false;
	}

	request.admin = admin;
	return true;
};

const validateSchoolOwner = async (request: AuthenticatedRequestInterface, allowWithoutSetPassword: boolean = false) => {
	const token = request.headers.authorization;

	if (!token) {
		return false;
	}

	const decoded = Utils.decryptJWTToken(token);

	if (!decoded) {
		return false;
	}

	const session = await dbService.findOne(Models.sessionModel, {
		token: token,
		refPath: Constants.SESSIONS_REF_PATH.SCHOOL_OWNER,
		type: Constants.SESSION.LOGIN,
		expirationTime: { $gt: new Date() }
	});

	if (!session) {
		return false;
	}

	const schoolOwner = await dbService.findOne(Models.schoolOwnerModel, {
		_id: decoded.id,
		...(!allowWithoutSetPassword && { hasSetPassword: true }),
		isDeleted: false,
		isEnabled: true
	});

	if (!schoolOwner) {
		return false;
	}

	request.schoolOwner = schoolOwner;
	return true;
};

const validateSchoolOwnerForgotPassword = async (request: AuthenticatedRequestInterface) => {
	const token = request.headers.authorization;

	if (!token) {
		return false;
	}

	const decoded = Utils.decryptJWTToken(token);

	if (!decoded) {
		return false;
	}

	const session = await dbService.findOne(Models.sessionModel, {
		token: token,
		refPath: Constants.SESSIONS_REF_PATH.SCHOOL_OWNER,
		type: Constants.SESSION.FORGOT_PASSWORD,
		expirationTime: { $gt: new Date() }
	});

	if (!session) {
		return false;
	}

	const schoolOwner = await dbService.findOne(Models.schoolOwnerModel, {
		_id: session.userId,
		isDeleted: false
	});

	if (!schoolOwner) {
		return false;
	}

	request.schoolOwner = schoolOwner;
	return true;
};

export default authService;
