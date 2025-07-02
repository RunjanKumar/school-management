import { Constants } from '../../../commons/constants';
import { schoolOwnerController } from '../../../controllers';
import joiUtils from '../../../utils/joiUtils';

const Joi = joiUtils.Joi;

const routes: any = [
	{
		method: 'POST',
		path: '/v1/schoolOwner',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('School owner\'s JWT token')
			},
			body: {
				name: Joi.string().required().description('Name of the school owner'),
				email: Joi.string().email().lowercase().required().description('Email of the school owner'),
				contactNumber: Joi.string().phoneNumber().required().description('Contact number of the school owner'),
				alternateContactNumber: Joi.string().phoneNumber().optional().description('Alternate contact number of the school owner'),
				isEnabled: Joi.boolean().optional().description('Enable/disable school owner')
			},
			group: 'School Owner',
			description: 'API to create a school owner.',
			model: 'CreateSchoolOwner'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN,
		handler: schoolOwnerController.createSchoolOwner
	},
	{
		method: 'PUT',
		path: '/v1/schoolOwner',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Admin\'s JWT token')
			},
			body: {
				schoolOwnerId: Joi.string().required().description('School owner ID'),
				name: Joi.string().optional().description('Name of the school owner'),
				email: Joi.string().email().lowercase().optional().description('Email of the school owner'),
				contactNumber: Joi.string().phoneNumber().optional().description('Contact number of the school owner'),
				alternateContactNumber: Joi.string().phoneNumber().optional().description('Alternate contact number of the school owner'),
				isEnabled: Joi.boolean().optional().description('Enable/disable school owner')
			},
			group: 'School Owner',
			description: 'API to update a school owner.',
			model: 'UpdateSchoolOwner'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN,
		handler: schoolOwnerController.updateSchoolOwner
	},
	{
		method: 'GET',
		path: '/v1/schoolOwner',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Admin\'s JWT token')
			},
			query: {
				skip: Joi.number().min(0).default(0).description('Skip'),
				limit: Joi.number().min(1).default(10).description('Limit'),
				sortKey: Joi.string().valid('name', 'email', 'contactNumber', 'isEnabled', 'createdAt').default('createdAt').description('Sort key'),
				sortDirection: Joi.number().optional().valid(1, -1).default(-1).description('Sort direction'),
				searchString: Joi.string().optional().description('Search string; applies to name, email and contact number')
			},
			group: 'School Owner',
			description: 'API to list school owners.',
			model: 'ListSchoolOwners'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN,
		handler: schoolOwnerController.listSchoolOwners
	},
	{
		method: 'GET',
		path: '/v1/schoolOwner/details',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Admin\'s JWT token')
			},
			query: {
				schoolOwnerId: Joi.string().required().description('School owner ID')
			},
			group: 'School Owner',
			description: 'API to fetch school owner details.',
			model: 'FetchSchoolOwnerDetails'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN,
		handler: schoolOwnerController.fetchSchoolOwnerDetails
	},
	{
		method: 'DELETE',
		path: '/v1/schoolOwner',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Admin\'s JWT token')
			},
			body: {
				schoolOwnerIds: Joi.array().items(Joi.string().mongoId()).required().description('School owner IDs')
			},
			group: 'School Owner',
			description: 'API to delete a school owner.',
			model: 'DeleteSchoolOwner'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN,
		handler: schoolOwnerController.deleteSchoolOwners
	},
	{
		method: 'POST',
		path: '/v1/schoolOwner/login',
		joiSchemaForSwagger: {
			body: {
				email: Joi.string().email().lowercase().required().description('Email of the school owner'),
				password: Joi.string().required().description('Password of the school owner')
			},
			group: 'School Owner',
			description: 'API to login a school owner.',
			model: 'LoginSchoolOwner'
		},
		handler: schoolOwnerController.loginSchoolOwner
	},
	{
		method: 'PUT',
		path: '/v1/schoolOwner/changePassword',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('School owner\'s JWT token')
			},
			body: {
				password: Joi.string().required().description('Current password of the school owner'),
				newPassword: Joi.string().password().required().description('New password of the school owner')
			},
			group: 'School Owner',
			description: 'API to change password of a school owner.',
			model: 'ChangePassword'
		},
		auth: Constants.AVAILABLE_AUTHS.SCHOOL_OWNER,
		allowWithoutSetPassword: true,
		handler: schoolOwnerController.changePassword
	}
];

export default routes;
