import { Constants } from '../../../commons/constants';
import { schoolEducationLevelController } from '../../../controllers';
import joiUtils from '../../../utils/joiUtils';

const Joi = joiUtils.Joi;

const routes: any = [
	{
		method: 'POST',
		path: '/v1/schoolEducationLevel',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Admin\'s JWT token')
			},
			body: {
				name: Joi.string().lowercase().required().description('Name of the school education level')
			},
			group: 'SchoolEducationLevel',
			description: 'Create a new school education level',
			model: 'CreateSchoolEducationLevel'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN,
		handler: schoolEducationLevelController.createSchoolEducationLevel
	},
	{
		method: 'PUT',
		path: '/v1/schoolEducationLevel',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Admin\'s JWT token')
			},
			body: {
				schoolEducationLevelId: Joi.string().mongoId().required().description('School education level ID'),
				name: Joi.string().lowercase().required().description('Name of the school education level')
			},
			group: 'SchoolEducationLevel',
			description: 'Update a school education level',
			model: 'UpdateSchoolEducationLevel'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN,
		handler: schoolEducationLevelController.updateSchoolEducationLevel
	},
	{
		method: 'GET',
		path: '/v1/schoolEducationLevel',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('JWT token')
			},
			query: {
				schoolEducationLevelId: Joi.string().mongoId().optional().description('School education level ID'),
				searchString: Joi.string().optional().description('Search string; applies on name field'),
				skip: Joi.number().min(0).default(0).description('Skip'),
				limit: Joi.number().min(1).default(10).description('Limit'),
				sortKey: Joi.string().valid('name', 'createdAt').default('createdAt').description('Sort key'),
				sortDirection: Joi.number().valid(1, -1).default(-1).description('Sort direction')
			},
			group: 'SchoolEducationLevel',
			description: 'Get all school education levels',
			model: 'GetSchoolEducationLevels'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN_AND_SCHOOL_OWNER,
		handler: schoolEducationLevelController.getSchoolEducationLevels
	},
	{
		method: 'DELETE',
		path: '/v1/schoolEducationLevel',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Admin\'s JWT token')
			},
			body: {
				schoolEducationLevelIds: Joi.array().items(Joi.string().mongoId()).min(1).unique().required().description('School education level IDs')
			},
			group: 'SchoolEducationLevel',
			description: 'Delete school education levels',
			model: 'DeleteSchoolEducationLevel'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN,
		handler: schoolEducationLevelController.deleteSchoolEducationLevel
	}
];

export default routes;
