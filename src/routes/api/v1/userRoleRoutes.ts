import { Constants } from '../../../commons/constants';
import { userRoleController } from '../../../controllers';
import joiUtils from '../../../utils/joiUtils';

const Joi = joiUtils.Joi;

const routes: any = [
	{
		method: 'POST',
		path: '/v1/userRole',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('School Owner\'s JWT token')
			},
			body: {
				name: Joi.string().required().description('Name of the user role'),
				schoolPermissions: Joi.array()
					.items(
						Joi.object({
							schoolId: Joi.string().mongoId().required().description('School ID'),
							permissions: Joi.array()
								.items(Joi.number().valid(...Object.values(Constants.USER_ROLE_PERMISSIONS)))
								.unique()
								.required()
								.description('Permissions array')
						})
					)
					.required()
					.description('Array of school permissions')
			},
			group: 'UserRole',
			description: 'Create a new user role',
			model: 'CreateUserRole'
		},
		auth: Constants.AVAILABLE_AUTHS.SCHOOL_OWNER,
		handler: userRoleController.createUserRole
	},
	{
		method: 'PUT',
		path: '/v1/userRole',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('School Owner\'s JWT token')
			},
			body: {
				userRoleId: Joi.string().mongoId().required().description('User role ID'),
				name: Joi.string().required().description('Name of the user role'),
				schoolPermissions: Joi.array()
					.items(
						Joi.object({
							schoolId: Joi.string().mongoId().required().description('School ID'),
							permissions: Joi.array()
								.items(Joi.number().valid(...Object.values(Constants.USER_ROLE_PERMISSIONS)))
								.unique()
								.required()
								.description('Permissions array')
						})
					)
					.required()
					.description('Array of school permissions')
			},
			group: 'UserRole',
			description: 'Update a user role',
			model: 'UpdateUserRole'
		},
		auth: Constants.AVAILABLE_AUTHS.SCHOOL_OWNER,
		handler: userRoleController.updateUserRole
	},
	{
		method: 'GET',
		path: '/v1/userRole',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('School Owner\'s JWT token')
			},
			query: {
				userRoleId: Joi.string().mongoId().optional().description('User role ID'),
				searchString: Joi.string().optional().description('Search string; applies on name field'),
				skip: Joi.number().min(0).default(0).description('Skip'),
				limit: Joi.number().min(1).default(10).description('Limit'),
				sortKey: Joi.string().valid('name', 'createdAt').default('createdAt').description('Sort key'),
				sortDirection: Joi.number().valid(1, -1).default(-1).description('Sort direction')
			},
			group: 'UserRole',
			description: 'Get all user roles',
			model: 'GetUserRoles'
		},
		auth: Constants.AVAILABLE_AUTHS.SCHOOL_OWNER,
		handler: userRoleController.getUserRoles
	},
	{
		method: 'DELETE',
		path: '/v1/userRole',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('School Owner\'s JWT token')
			},
			body: {
				userRoleIds: Joi.array().items(Joi.string().mongoId()).min(1).unique().required().description('User role IDs')
			},
			group: 'UserRole',
			description: 'Delete user roles',
			model: 'DeleteUserRole'
		},
		auth: Constants.AVAILABLE_AUTHS.SCHOOL_OWNER,
		handler: userRoleController.deleteUserRoles
	}
];

export default routes;
