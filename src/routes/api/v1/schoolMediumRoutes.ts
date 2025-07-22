import { Constants } from '../../../commons/constants';
import { schoolMediumController } from '../../../controllers';
import joiUtils from '../../../utils/joiUtils';

const Joi = joiUtils.Joi;

const routes: any = [
	{
		method: 'POST',
		path: '/v1/schoolMedium',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Admin\'s JWT token')
			},
			body: {
				name: Joi.string().lowercase().required().description('Name of the school medium')
			},
			group: 'SchoolMedium',
			description: 'Create a new school medium',
			model: 'CreateSchoolMedium'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN,
		handler: schoolMediumController.createSchoolMedium
	},
	{
		method: 'PUT',
		path: '/v1/schoolMedium',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Admin\'s JWT token')
			},
			body: {
				schoolMediumId: Joi.string().mongoId().required().description('School medium ID'),
				name: Joi.string().lowercase().required().description('Name of the school medium')
			},
			group: 'SchoolMedium',
			description: 'Update a school medium',
			model: 'UpdateSchoolMedium'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN,
		handler: schoolMediumController.updateSchoolMedium
	},
	{
		method: 'GET',
		path: '/v1/schoolMedium',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('JWT token')
			},
			query: {
				schoolMediumId: Joi.string().mongoId().optional().description('School medium ID'),
				searchString: Joi.string().optional().description('Search string; applies on name field'),
				skip: Joi.number().min(0).default(0).description('Skip'),
				limit: Joi.number().min(1).default(10).description('Limit'),
				sortKey: Joi.string().valid('name', 'createdAt').default('createdAt').description('Sort key'),
				sortDirection: Joi.number().valid(1, -1).default(-1).description('Sort direction')
			},
			group: 'SchoolMedium',
			description: 'Get all school mediums',
			model: 'GetSchoolMediums'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN_AND_SCHOOL_OWNER,
		handler: schoolMediumController.getSchoolMediums
	},
	{
		method: 'DELETE',
		path: '/v1/schoolMedium',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Admin\'s JWT token')
			},
			body: {
				schoolMediumIds: Joi.array().items(Joi.string().mongoId()).min(1).unique().required().description('School medium IDs')
			},
			group: 'SchoolMedium',
			description: 'Delete school mediums',
			model: 'DeleteSchoolMedium'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN,
		handler: schoolMediumController.deleteSchoolMedium
	}
];

export default routes;
