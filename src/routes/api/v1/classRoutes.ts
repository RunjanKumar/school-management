import { Constants } from '../../../commons/constants';
import { classController } from '../../../controllers';
import joiUtils from '../../../utils/joiUtils';

const Joi = joiUtils.Joi;

const routes: any = [
	{
		method: 'POST',
		path: '/v1/class',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('JWT token of the admin or school owner')
			},
			body: {
				name: Joi.string().required().description('Name of the class'),
				schoolId: Joi.string().mongoId().required().description('School ID to which class belongs'),
				description: Joi.string().optional().description('Optional class description'),
				capacity: Joi.number().min(1).optional().description('Max capacity of students in the class')
			},
			group: 'Class',
			description: 'API to create a class',
			model: 'CreateClass'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN_AND_SCHOOL_OWNER, // or SCHOOL_OWNER if defined separately
		handler: classController.createClass
	},

	{
		method: 'GET',
		path: '/v1/class/:schoolId',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('JWT token of the admin or school owner')
			},
			params: {
				schoolId: Joi.string().mongoId().required().description('School ID to fetch classes for')
			},
			group: 'Class',
			description: 'API to get all classes of a school',
			model: 'GetClasses'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN_AND_SCHOOL_OWNER,
		handler: classController.getClassesBySchool
	},

	{
		method: 'PUT',
		path: '/v1/class/:classId/:schoolId',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('JWT token of the admin or school owner')
			},
			params: {
				classId: Joi.string().mongoId().required().description('Class ID to update'),
				schoolId: Joi.string().mongoId().required().description('School ID to update')
			},
			body: {
				name: Joi.string().optional().description('Updated name of the class'),
				description: Joi.string().optional().description('Updated description'),
				capacity: Joi.number().min(1).optional().description('Updated capacity')
			},
			group: 'Class',
			description: 'API to update class details',
			model: 'UpdateClass'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN_AND_SCHOOL_OWNER,
		handler: classController.updateClass
	},

	{
		method: 'DELETE',
		path: '/v1/class/:classId/:schoolId',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('JWT token of the admin or school owner')
			},
			params: {
				classId: Joi.string().mongoId().required().description('Class ID to delete'),
				schoolId: Joi.string().mongoId().required().description('School ID to delete')
			},
			group: 'Class',
			description: 'API to soft-delete a class',
			model: 'DeleteClass'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN_AND_SCHOOL_OWNER,
		handler: classController.deleteClass
	}
];

export default routes;
