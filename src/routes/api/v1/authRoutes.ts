import { Constants } from '../../../commons/constants';
import { authController } from '../../../controllers';
import joiUtils from '../../../utils/joiUtils';

const Joi = joiUtils.Joi;

const routes: any = [
	{
		method: 'POST',
		path: '/v1/auth/signup',
		joiSchemaForSwagger: {
			body: {
				name: Joi.string().required().description('Full name of the user'),
				email: Joi.string().email().lowercase().required().description('Email of the user'),
				password: Joi.string().password().required().description('Password of the user')
			},
			group: 'Auth',
			description: 'API to register a new user with email and password.',
			model: 'UserSignup'
		},
		getExactRequest: true,
		handler: authController.signup
	},
	{
		method: 'POST',
		path: '/v1/auth/login',
		joiSchemaForSwagger: {
			body: {
				email: Joi.string().email().lowercase().required().description('Email of the user'),
				password: Joi.string().required().description('Password of the user'),
				rememberMe: Joi.boolean().optional().default(false).description('Remember me (extends refresh token expiry to 30 days)')
			},
			group: 'Auth',
			description: 'API to login a user with email and password.',
			model: 'UserLogin'
		},
		getExactRequest: true,
		handler: authController.login
	},
	{
		method: 'POST',
		path: '/v1/auth/refresh',
		joiSchemaForSwagger: {
			group: 'Auth',
			description: 'API to refresh access token using refresh token cookie.',
			model: 'RefreshToken'
		},
		getExactRequest: true,
		handler: authController.refreshAccessToken
	},
	{
		method: 'POST',
		path: '/v1/auth/logout',
		joiSchemaForSwagger: {
			group: 'Auth',
			description: 'API to logout user and invalidate refresh token.',
			model: 'UserLogout'
		},
		getExactRequest: true,
		handler: authController.logout
	},
	{
		method: 'GET',
		path: '/v1/auth/google',
		joiSchemaForSwagger: {
			group: 'Auth',
			description: 'API to redirect to Google OAuth consent screen.',
			model: 'GoogleRedirect'
		},
		getExactRequest: true,
		notSendResponse: true,
		handler: authController.googleRedirect
	},
	{
		method: 'GET',
		path: '/v1/auth/google/callback',
		joiSchemaForSwagger: {
			query: {
				code: Joi.string().optional().description('Authorization code from Google'),
				state: Joi.string().optional().description('OAuth state parameter')
			},
			group: 'Auth',
			description: 'Google OAuth callback handler.',
			model: 'GoogleCallback'
		},
		getExactRequest: true,
		notSendResponse: true,
		handler: authController.googleCallback
	},
	{
		method: 'POST',
		path: '/v1/auth/forgotPassword',
		joiSchemaForSwagger: {
			body: {
				email: Joi.string().email().lowercase().required().description('Email of the user')
			},
			group: 'Auth',
			description: 'API to send forgot password email.',
			model: 'UserForgotPassword'
		},
		handler: authController.forgotPassword
	},
	{
		method: 'POST',
		path: '/v1/auth/resetPassword',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Forgot password JWT token')
			},
			body: {
				password: Joi.string().password().required().description('New password')
			},
			group: 'Auth',
			description: 'API to reset password using forgot password token.',
			model: 'UserResetPassword'
		},
		auth: Constants.AVAILABLE_AUTHS.USER_FORGOT_PASSWORD,
		handler: authController.resetPassword
	},
	{
		method: 'GET',
		path: '/v1/auth/profile',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('User access token')
			},
			group: 'Auth',
			description: 'API to get authenticated user profile.',
			model: 'UserProfile'
		},
		auth: Constants.AVAILABLE_AUTHS.USER,
		handler: authController.getProfile
	}
];

export default routes;
