import { Constants } from '../../../commons/constants';
import { schoolBoardController } from '../../../controllers';
import joiUtils from '../../../utils/joiUtils';

const Joi = joiUtils.Joi;

const routes: any = [
	{
		method: 'POST',
		path: '/v1/schoolBoard',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Admin\'s JWT token')
			},
			body: {
				name: Joi.string().lowercase().required().description('Name of the school board'),
				type: Joi.number()
					.valid(...Object.values(Constants.SCHOOL_BOARD_TYPES))
					.required()
					.description('Type of the school board')
			},
			group: 'SchoolBoard',
			description: 'Create a new school board',
			model: 'CreateSchoolBoard'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN,
		handler: schoolBoardController.createSchoolBoard
	},
	{
		method: 'PUT',
		path: '/v1/schoolBoard',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Admin\'s JWT token')
			},
			body: {
				schoolBoardId: Joi.string().required().description('School board ID'),
				name: Joi.string().lowercase().required().description('Name of the school board'),
				type: Joi.number()
					.valid(...Object.values(Constants.SCHOOL_BOARD_TYPES))
					.required()
					.description('Type of the school board')
			},
			group: 'SchoolBoard',
			description: 'Update a school board',
			model: 'UpdateSchoolBoard'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN,
		handler: schoolBoardController.updateSchoolBoard
	},
	{
		method: 'GET',
		path: '/v1/schoolBoard',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('JWT token')
			},
			query: {
				schoolBoardId: Joi.string().mongoId().optional().description('School board ID'),
				type: Joi.number()
					.valid(...Object.values(Constants.SCHOOL_BOARD_TYPES))
					.optional()
					.description('Type of the school board'),
				skip: Joi.number().min(0).default(0).description('Skip'),
				limit: Joi.number().min(1).default(10).description('Limit'),
				sortKey: Joi.string().valid('name', 'type', 'createdAt').default('createdAt').description('Sort key'),
				sortDirection: Joi.number().valid(1, -1).default(-1).description('Sort direction'),
				searchString: Joi.string().optional().description('Search string; applies on name field')
			},
			group: 'SchoolBoard',
			description: 'Get all school boards',
			model: 'GetSchoolBoards'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN_AND_SCHOOL_OWNER,
		handler: schoolBoardController.getSchoolBoards
	},
	{
		method: 'DELETE',
		path: '/v1/schoolBoard',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Admin\'s JWT token')
			},
			body: {
				schoolBoardIds: Joi.array().items(Joi.string().mongoId()).min(1).unique().required().description('School board IDs')
			},
			group: 'SchoolBoard',
			description: 'Delete a school board',
			model: 'DeleteSchoolBoard'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN,
		handler: schoolBoardController.deleteSchoolBoard
	}
];

export default routes;
