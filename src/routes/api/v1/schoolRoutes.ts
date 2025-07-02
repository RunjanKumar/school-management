import { Constants } from '../../../commons/constants';
import { schoolController } from '../../../controllers';
import joiUtils from '../../../utils/joiUtils';

const Joi = joiUtils.Joi;

const routes: any = [
	{
		method: 'POST',
		path: '/v1/school',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('School owner\'s JWT token')
			},
			body: {
				name: Joi.string().required().description('Name of the school'),
				website: Joi.string().optional().description('Website of the school'),
				email: Joi.string().email().lowercase().required().description('Email of the school'),
				contactNumber: Joi.string().phoneNumber().required().description('Contact number of the school'),
				address: Joi.object().keys({
					city: Joi.string().required().description('City of the school'),
					state: Joi.string().required().description('State of the school'),
					zipcode: Joi.string().required().description('Zipcode of the school'),
					address: Joi.string().required().description('Address of the school'),
					landmark: Joi.string().optional().description('Landmark of the school')
				})
			},
			group: 'School',
			description: 'API to create a school.',
			model: 'CreateSchool'
		},
		auth: Constants.AVAILABLE_AUTHS.SCHOOL_OWNER,
		handler: schoolController.createSchool
	},
	{
		method: 'PUT',
		path: '/v1/school',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('School owner\'s JWT token')
			},
			body: {
				schoolId: Joi.string().mongoId().required().description('School ID'),
				name: Joi.string().required().description('Name of the school'),
				website: Joi.string().optional().description('Website of the school'),
				email: Joi.string().email().lowercase().required().description('Email of the school'),
				contactNumber: Joi.string().phoneNumber().required().description('Contact number of the school'),
				address: Joi.object().keys({
					city: Joi.string().required().description('City of the school'),
					state: Joi.string().required().description('State of the school'),
					zipcode: Joi.string().required().description('Zipcode of the school'),
					address: Joi.string().required().description('Address of the school'),
					landmark: Joi.string().optional().description('Landmark of the school')
				})
			},
			group: 'School',
			description: 'API to update a school.',
			model: 'UpdateSchool'
		},
		auth: Constants.AVAILABLE_AUTHS.SCHOOL_OWNER,
		handler: schoolController.updateSchool
	},
	{
		method: 'GET',
		path: '/v1/school',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('School owner\'s JWT token')
			},
			query: {
				skip: Joi.number().min(0).default(0).description('Skip number'),
				limit: Joi.number().min(1).default(10).description('Limit per page'),
				sortKey: Joi.string().valid('createdAt', 'name', 'email', 'contactNumber').default('createdAt').description('Sort by'),
				sortOrder: Joi.number().valid(1, -1).default(1).description('Sort order'),
				searchString: Joi.string().optional().description('Search by name, email or contact number')
			},
			group: 'School',
			description: 'API to get all schools.',
			model: 'GetSchools'
		},
		auth: Constants.AVAILABLE_AUTHS.SCHOOL_OWNER,
		handler: schoolController.getSchools
	},
	{
		method: 'DELETE',
		path: '/v1/school',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('School owner\'s JWT token')
			},
			body: {
				schoolIds: Joi.array().items(Joi.string().mongoId()).required().description('School IDs')
			},
			group: 'School',
			description: 'API to delete schools.',
			model: 'DeleteSchools'
		},
		auth: Constants.AVAILABLE_AUTHS.SCHOOL_OWNER,
		handler: schoolController.deleteSchools
	}
];

export default routes;
