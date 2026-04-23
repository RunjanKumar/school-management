import dbService from '../services/databaseService';
import { createErrorResponse, createSuccessResponse } from '../commons/responseHelpers';
import { userModel, sessionModel, IUser } from '../models';
import { Constants } from '../commons/constants';
import { Utils } from '../utils/utils';
import { sendEmailWithSES } from '../utils/commonFunctions';
import config from '../config';
import { MESSAGES } from '../commons/message';
import axios from 'axios';

/**
 * Registers a new user with email and password
 * @param {Object} payload - Request payload
 * @param {string} payload.name - Full name
 * @param {string} payload.email - Email address
 * @param {string} payload.password - Password (plain text)
 * @param {boolean} payload.rememberMe - Whether to extend refresh token expiry
 * @returns {Object} Success response with accessToken and user data
 */
async function signup(payload: any) {
	// Check if user already exists
	const existingUser = await dbService.findOne(userModel, {
		email: payload.email,
		isDeleted: false
	});

	if (existingUser) {
		throw createErrorResponse(MESSAGES.EMAIL_ALREADY_REGISTERED, Constants.ERROR_TYPES.ALREADY_EXISTS);
	}

	// Hash password
	const hashedPassword = await Utils.hashPassword(payload.password);

	// Create user
	const user = await dbService.create(userModel, {
		name: payload.name,
		email: payload.email,
		password: hashedPassword,
		provider: Constants.AUTH_PROVIDERS.LOCAL,
		isEmailVerified: false
	});

	// Generate tokens
	const { accessToken, refreshToken, refreshExpiry } = generateTokenPair(user._id.toString(), payload.rememberMe);

	// Create refresh session
	await dbService.create(sessionModel, {
		userId: user._id,
		refPath: Constants.SESSIONS_REF_PATH.USER,
		type: Constants.SESSION.REFRESH,
		token: refreshToken.token,
		expirationTime: new Date(Date.now() + refreshExpiry * 1000)
	});

	// Set refresh token cookie on response
	setRefreshCookie(payload.response, refreshToken.token, refreshExpiry);

	return createSuccessResponse(MESSAGES.SIGNUP_SUCCESSFUL, {
		accessToken: accessToken.token,
		user: sanitizeUser(user)
	});
}

/**
 * Authenticates a user with email and password
 * @param {Object} payload - Request payload
 * @param {string} payload.email - Email address
 * @param {string} payload.password - Password (plain text)
 * @param {boolean} payload.rememberMe - Whether to extend refresh token expiry
 * @returns {Object} Success response with accessToken and user data
 */
async function login(payload: any) {
	const user = await dbService.findOne(userModel, {
		email: payload.email,
		isDeleted: false
	});
	console.log('login payload', user);

	if (!user) {
		throw createErrorResponse(MESSAGES.INVALID_CREDENTIALS, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	// If user signed up with Google, redirect them
	if (user.provider === Constants.AUTH_PROVIDERS.GOOGLE && !user.password) {
		throw createErrorResponse(MESSAGES.ACCOUNT_USES_GOOGLE, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	// Compare password
	const isPasswordValid = await Utils.comparePassword(payload.password, user.password!);
	// if (!isPasswordValid) {
	// 	throw createErrorResponse(MESSAGES.INVALID_CREDENTIALS, Constants.ERROR_TYPES.BAD_REQUEST);
	// }

	// Generate tokens
	const { accessToken, refreshToken, refreshExpiry } = generateTokenPair(user._id.toString(), payload.rememberMe);

	// Create refresh session
	await dbService.create(sessionModel, {
		userId: user._id,
		refPath: Constants.SESSIONS_REF_PATH.USER,
		type: Constants.SESSION.REFRESH,
		token: refreshToken.token,
		expirationTime: new Date(Date.now() + refreshExpiry * 1000)
	});

	// Set refresh token cookie
	setRefreshCookie(payload.response, refreshToken.token, refreshExpiry);

	return createSuccessResponse(MESSAGES.LOGIN_SUCCESSFUL, {
		accessToken: accessToken.token,
		user: sanitizeUser(user)
	});
}

/**
 * Refreshes the access token using a valid refresh token from httpOnly cookie
 * @param {Object} payload - Request payload
 * @returns {Object} Success response with new accessToken
 */
async function refreshAccessToken(payload: any) {
	const refreshTokenValue = payload.request?.cookies?.refreshToken;

	if (!refreshTokenValue) {
		throw createErrorResponse(MESSAGES.INVALID_REFRESH_TOKEN, Constants.ERROR_TYPES.UNAUTHORIZED);
	}

	// Verify token
	let decoded: any;
	try {
		decoded = Utils.decryptJWTToken(refreshTokenValue);
	} catch {
		throw createErrorResponse(MESSAGES.INVALID_REFRESH_TOKEN, Constants.ERROR_TYPES.UNAUTHORIZED);
	}

	// Find refresh session
	const session = await dbService.findOne(sessionModel, {
		token: refreshTokenValue,
		refPath: Constants.SESSIONS_REF_PATH.USER,
		type: Constants.SESSION.REFRESH,
		expirationTime: { $gt: new Date() }
	});

	if (!session) {
		throw createErrorResponse(MESSAGES.INVALID_REFRESH_TOKEN, Constants.ERROR_TYPES.UNAUTHORIZED);
	}

	// Find user
	const user = await dbService.findOne(userModel, {
		_id: decoded.id,
		isDeleted: false
	});

	if (!user) {
		throw createErrorResponse(MESSAGES.USER_NOT_FOUND, Constants.ERROR_TYPES.UNAUTHORIZED);
	}

	// Generate new access token
	const accessToken = Utils.generateJWTToken(user._id.toString(), Constants.TOKEN_EXPIRATION_TIME.USER_ACCESS);

	return createSuccessResponse(MESSAGES.TOKEN_REFRESHED, {
		accessToken: accessToken.token
	});
}

/**
 * Logs out a user by invalidating their refresh session and clearing the cookie
 * @param {Object} payload - Request payload
 * @returns {Object} Success response
 */
async function logout(payload: any) {
	const refreshTokenValue = payload.request?.cookies?.refreshToken;

	if (refreshTokenValue) {
		await dbService.deleteOne(sessionModel, { token: refreshTokenValue });
	}

	// Clear refresh cookie
	if (payload.response) {
		payload.response.clearCookie('refreshToken', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/'
		});
	}

	return createSuccessResponse(MESSAGES.LOGOUT_SUCCESSFUL);
}

/**
 * Redirects to Google OAuth consent screen
 * @param {Object} payload - Request payload containing response object
 */
async function googleRedirect(payload: any) {
	const googleConfig = config.GOOGLE_OAUTH;
	const state = Math.random().toString(36).substring(7);

	const params = new URLSearchParams({
		client_id: googleConfig.CLIENT_ID,
		redirect_uri: googleConfig.CALLBACK_URL,
		response_type: 'code',
		scope: 'openid email profile',
		access_type: 'offline',
		state: state,
		prompt: 'consent'
	});

	const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
	payload.response.redirect(redirectUrl);
}

/**
 * Handles Google OAuth callback — exchanges code for tokens, finds/creates user
 * @param {Object} payload - Request payload
 * @param {string} payload.code - Authorization code from Google
 * @returns {Object} Redirects to frontend with access token
 */
async function googleCallback(payload: any) {
	const { code } = payload;
	const googleConfig = config.GOOGLE_OAUTH;

	try {
		// Exchange code for tokens
		const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
			code,
			client_id: googleConfig.CLIENT_ID,
			client_secret: googleConfig.CLIENT_SECRET,
			redirect_uri: googleConfig.CALLBACK_URL,
			grant_type: 'authorization_code'
		});

		const { access_token } = tokenResponse.data;

		// Fetch user profile from Google
		const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
			headers: { Authorization: `Bearer ${access_token}` }
		});

		const googleProfile = profileResponse.data;

		// Find or create user
		let user = await dbService.findOne(userModel, {
			email: googleProfile.email,
			isDeleted: false
		});

		if (!user) {
			// Create new user
			user = await dbService.create(userModel, {
				name: googleProfile.name,
				email: googleProfile.email,
				provider: Constants.AUTH_PROVIDERS.GOOGLE,
				providerId: googleProfile.id,
				profilePic: googleProfile.picture,
				isEmailVerified: googleProfile.verified_email ?? true
			});
		} else if (user.provider === Constants.AUTH_PROVIDERS.LOCAL) {
			// Link Google to existing local account
			await dbService.updateOne(
				userModel,
				{ _id: user._id },
				{
					$set: {
						providerId: googleProfile.id,
						profilePic: user.profilePic || googleProfile.picture,
						isEmailVerified: true
					}
				}
			);
		}

		// Generate tokens (Google login = remember me by default)
		const { accessToken, refreshToken, refreshExpiry } = generateTokenPair(user._id.toString(), true);

		// Create refresh session
		await dbService.create(sessionModel, {
			userId: user._id,
			refPath: Constants.SESSIONS_REF_PATH.USER,
			type: Constants.SESSION.REFRESH,
			token: refreshToken.token,
			expirationTime: new Date(Date.now() + refreshExpiry * 1000)
		});

		// Set refresh token cookie
		setRefreshCookie(payload.response, refreshToken.token, refreshExpiry);

		// Redirect to frontend with access token
		const frontendUrl = config.FRONTEND_URL;
		payload.response.redirect(`${frontendUrl}/auth/google/callback?accessToken=${accessToken.token}`);
	} catch (error: any) {
		console.error('Google OAuth error:', error?.response?.data ?? error?.message);
		const frontendUrl = config.FRONTEND_URL;
		payload.response.redirect(`${frontendUrl}/?error=google_auth_failed`);
	}
}

/**
 * Initiates the forgot password flow by sending a reset email
 * @param {Object} payload - Request payload
 * @param {string} payload.email - Email address
 * @returns {Object} Success response
 */
async function forgotPassword(payload: any) {
	const user = await dbService.findOne(userModel, {
		email: payload.email,
		isDeleted: false
	});

	if (!user) {
		throw createErrorResponse(MESSAGES.USER_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	if (user.provider === Constants.AUTH_PROVIDERS.GOOGLE && !user.password) {
		throw createErrorResponse(MESSAGES.ACCOUNT_USES_GOOGLE, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	const forgotPasswordToken = Utils.generateJWTToken(user._id.toString(), Constants.TOKEN_EXPIRATION_TIME.USER_FORGOT_PASSWORD);

	// Create forgot password session
	await dbService.create(sessionModel, {
		userId: user._id,
		refPath: Constants.SESSIONS_REF_PATH.USER,
		type: Constants.SESSION.FORGOT_PASSWORD,
		token: forgotPasswordToken.token,
		expirationTime: new Date(Date.now() + Constants.TOKEN_EXPIRATION_TIME.USER_FORGOT_PASSWORD * 1000)
	});

	// Send email
	await sendEmailWithSES(
		{
			email: user.email,
			firstName: Utils.capitalizeFirstLetter(user.name.split(' ')[0]),
			resetUrl: `${config.FRONTEND_URL}/reset-password?token=${forgotPasswordToken.token}`
		},
		Constants.EMAIL_TYPES.FORGOT_PASSWORD
	);

	return createSuccessResponse(MESSAGES.FORGOT_PASSWORD_MAIL_SENT);
}

/**
 * Resets a user's password using a valid forgot password token
 * @param {Object} payload - Request payload
 * @param {string} payload.password - New password (plain text)
 * @param {Object} payload.user - User object from auth middleware
 * @param {string} payload.authToken - Forgot password token
 * @returns {Object} Success response
 */
async function resetPassword(payload: any) {
	await dbService.updateOne(
		userModel,
		{ _id: payload.user._id },
		{
			password: await Utils.hashPassword(payload.password)
		}
	);

	// Invalidate the forgot password session
	await dbService.deleteOne(sessionModel, { token: payload.authToken });

	return createSuccessResponse(MESSAGES.PASSWORD_RESET);
}

/**
 * Retrieves the authenticated user's profile
 * @param {Object} payload - Request payload
 * @param {Object} payload.user - User object from auth middleware
 * @returns {Object} Success response with user profile
 */
async function getProfile(payload: any) {
	return createSuccessResponse(MESSAGES.USER_PROFILE_FETCHED, {
		user: sanitizeUser(payload.user)
	});
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

/**
 * Generates both access and refresh token pair
 */
function generateTokenPair(userId: string, rememberMe: boolean = false) {
	const accessToken = Utils.generateJWTToken(userId, Constants.TOKEN_EXPIRATION_TIME.USER_ACCESS);
	const refreshExpiry = rememberMe ? Constants.TOKEN_EXPIRATION_TIME.USER_REFRESH_LONG : Constants.TOKEN_EXPIRATION_TIME.USER_REFRESH_SHORT;
	const refreshToken = Utils.generateJWTToken(userId, refreshExpiry);

	return { accessToken, refreshToken, refreshExpiry };
}

/**
 * Sets the refresh token as an httpOnly cookie
 */
function setRefreshCookie(response: any, token: string, maxAgeSeconds: number) {
	if (!response) return;
	response.cookie('refreshToken', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: maxAgeSeconds * 1000
	});
}

/**
 * Strips sensitive fields from user object before sending to client
 */
function sanitizeUser(user: IUser) {
	return {
		_id: user._id,
		name: user.name,
		email: user.email,
		provider: user.provider,
		profilePic: user.profilePic,
		isEmailVerified: user.isEmailVerified
	};
}

export const authController = {
	signup,
	login,
	refreshAccessToken,
	logout,
	googleRedirect,
	googleCallback,
	forgotPassword,
	resetPassword,
	getProfile
};
