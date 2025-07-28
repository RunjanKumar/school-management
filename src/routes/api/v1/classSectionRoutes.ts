import { Constants } from '../../../commons/constants';
import { classSectionController } from '../../../controllers';
import joiUtils from '../../../utils/joiUtils';

const Joi = joiUtils.Joi;

const routes: any = [
	{
		method: 'POST',
		path: '/v1/class-section',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('JWT token of the admin or school owner')
			},
			body: {
				name: Joi.string().uppercase().required().description('Section name (e.g. A, B)'),
				classId: Joi.string().mongoId().required().description('Class ID this section belongs to'),
				schoolId: Joi.string().mongoId().required().description('School ID this section belongs to'),
				capacity: Joi.number().min(0).required().description('Max capacity of students in this section'),
				sectionHeadTeacherId: Joi.string().mongoId().optional().description('Optional head teacher ID')
			},
			group: 'Class Section',
			description: 'API to create a class section',
			model: 'CreateClassSection'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN_AND_SCHOOL_OWNER,
		handler: classSectionController.createClassSection
	},

	{
		method: 'GET',
		path: '/v1/class-section/:classId/:schoolId',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('JWT token of the admin or school owner')
			},
			params: {
				classId: Joi.string().mongoId().required().description('Class ID to fetch sections for'),
				schoolId: Joi.string().mongoId().required().description('School ID to fetch sections for')
			},
			group: 'Class Section',
			description: 'API to get all sections of a class',
			model: 'GetClassSections'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN_AND_SCHOOL_OWNER,
		handler: classSectionController.getSectionsByClass
	},

	{
		method: 'PUT',
		path: '/v1/class-section/:classSectionId/:schoolId',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('JWT token of the admin or school owner')
			},
			params: {
				classSectionId: Joi.string().mongoId().required().description('Class section ID to update'),
				schoolId: Joi.string().mongoId().required().description('School ID to update')
			},
			body: {
				name: Joi.string().uppercase().optional().description('Updated section name'),
				capacity: Joi.number().min(0).optional().description('Updated capacity'),
				sectionHeadTeacherId: Joi.string().mongoId().optional().description('Updated head teacher ID')
			},
			group: 'Class Section',
			description: 'API to update a class section',
			model: 'UpdateClassSection'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN_AND_SCHOOL_OWNER,
		handler: classSectionController.updateClassSection
	},
	{
		method: 'DELETE',
		path: '/v1/class-section/:classSectionId/:schoolId',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('JWT token of the admin or school owner')
			},
			params: {
				classSectionId: Joi.string().mongoId().required().description('Class section ID to delete'),
				schoolId: Joi.string().mongoId().required().description('School ID to delete')
			},
			group: 'Class Section',
			description: 'API to soft-delete a class section',
			model: 'DeleteClassSection'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN_AND_SCHOOL_OWNER,
		handler: classSectionController.deleteClassSection
	}
];

export default routes;
