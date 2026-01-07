import dbService from '../services/databaseService';
import { createErrorResponse, createSuccessResponse } from '../commons/responseHelpers';
import { adminModel, sessionModel, IAdmin } from '../models';
import { Constants } from '../commons/constants';
import { Utils } from '../utils/utils';
import { sendEmailWithSES } from '../utils/commonFunctions';
import config from '../config';
import { MESSAGES } from '../commons/message';

/**
 * Authenticates an admin and creates a login session
 * @param {Object} payload - Request payload containing login credentials
 * @param {string} payload.email - Email address of the admin
 * @param {string} payload.password - Password of the admin
 * @returns {Object} Success response with authentication token
 * @returns {string} returns.token - JWT token for authentication
 * @throws {Object} Error response if invalid credentials or admin not found
 */
async function loginAdmin(payload: any) {
	// fetch admin
	const admin: IAdmin | null = await dbService.findOne(adminModel, {
		email: payload.email,
		isDeleted: false
	});

	if (!admin) {
		throw createErrorResponse(MESSAGES.ADMIN_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	// check password
	if (!(await Utils.comparePassword(payload.password, admin.password))) {
		throw createErrorResponse(MESSAGES.ADMIN_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	// generate token
	const token = Utils.generateJWTToken(admin._id.toString(), Constants.TOKEN_EXPIRATION_TIME.ADMIN_LOGIN);

	// create session
	await dbService.create(sessionModel, {
		userId: admin._id,
		refPath: Constants.SESSIONS_REF_PATH.ADMIN,
		type: Constants.SESSION.LOGIN,
		token: token.token,
		expirationTime: new Date(Date.now() + Constants.TOKEN_EXPIRATION_TIME.ADMIN_LOGIN * 1000)
	});

	return createSuccessResponse(MESSAGES.LOGIN_SUCCESSFUL, { token: token.token });
}

/**
 * Retrieves the profile information of the authenticated admin
 * @param {Object} payload - Request payload containing admin data
 * @param {Object} payload.admin - Admin object containing profile information
 * @param {string} payload.admin._id - ID of the admin
 * @param {string} payload.admin.name - Name of the admin
 * @param {string} payload.admin.email - Email address of the admin
 * @returns {Object} Success response with admin profile data
 * @returns {Object} returns.admin - Admin profile object
 * @throws {Object} Error response if profile retrieval fails
 */
async function getAdminProfile(payload: any) {
	return createSuccessResponse(MESSAGES.ADMIN_PROFILE_FETCHED, {
		admin: {
			_id: payload.admin._id,
			name: payload.admin.name,
			email: payload.admin.email
		}
	});
}

/**
 * Logs out an admin by invalidating their session token
 * @param {Object} payload - Request payload containing authentication details
 * @param {Object} payload.admin - Admin object containing _id
 * @param {string} payload.admin._id - ID of the admin
 * @param {string} payload.authToken - Authentication token to invalidate
 * @returns {Object} Success response indicating logout was successful
 * @throws {Object} Error response if logout fails
 */
async function logoutAdmin(payload: any) {
	await dbService.deleteOne(sessionModel, { token: payload.authToken });

	return createSuccessResponse(MESSAGES.LOGOUT_SUCCESSFUL);
}

/**
 * Initiates the forgot password process by sending a reset email
 * @param {Object} payload - Request payload containing admin email
 * @param {string} payload.email - Email address of the admin requesting password reset
 * @returns {Object} Success response indicating reset email was sent
 * @throws {Object} Error response if admin not found or email sending fails
 */
async function forgotAdminPassword(payload: any) {
	const admin: IAdmin | null = await dbService.findOne(adminModel, { email: payload.email });

	if (!admin) {
		throw createErrorResponse(MESSAGES.ADMIN_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	const forgotPasswordToken = Utils.generateJWTToken(admin._id.toString(), Constants.TOKEN_EXPIRATION_TIME.ADMIN_FORGOT_PASSWORD);

	await dbService.create(sessionModel, {
		userId: admin._id,
		refPath: Constants.SESSIONS_REF_PATH.ADMIN,
		type: Constants.SESSION.FORGOT_PASSWORD,
		token: forgotPasswordToken.token,
		expirationTime: new Date(Date.now() + Constants.TOKEN_EXPIRATION_TIME.ADMIN_FORGOT_PASSWORD * 1000)
	});
	await sendEmailWithSES(
		{
			email: admin.email,
			firstName: Utils.capitalizeFirstLetter(admin.name.split(' ')[0]),
			resetUrl: `${config.SERVER_URL}/reset-password?token=${forgotPasswordToken.token}`
		},
		Constants.EMAIL_TYPES.FORGOT_PASSWORD
	);

	return createSuccessResponse(MESSAGES.FORGOT_PASSWORD_MAIL_SENT);
}

/**
 * Resets the admin password using a valid reset token
 * @param {Object} payload - Request payload containing password reset details
 * @param {Object} payload.admin - Admin object containing _id
 * @param {string} payload.admin._id - ID of the admin
 * @param {string} payload.password - New password to set (plain text)
 * @param {string} payload.authToken - Authentication token to invalidate after reset
 * @returns {Object} Success response indicating password was reset
 * @throws {Object} Error response if password reset fails
 */
async function resetAdminPassword(payload: any) {
	await dbService.updateOne(adminModel, { _id: payload.admin._id }, { password: await Utils.hashPassword(payload.password) });

	await dbService.deleteOne(sessionModel, { token: payload.authToken });

	return createSuccessResponse(MESSAGES.PASSWORD_RESET);
}

export const adminController = {
	loginAdmin,
	getAdminProfile,
	logoutAdmin,
	forgotAdminPassword,
	resetAdminPassword
};
