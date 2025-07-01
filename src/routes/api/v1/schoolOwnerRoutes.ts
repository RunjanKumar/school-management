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
				alternateContactNumber: Joi.string().phoneNumber().optional().description('Alternate contact number of the school owner')
			},
			group: 'School Owner',
			description: 'API to create a school owner.',
			model: 'CreateSchoolOwner'
		},
		handler: schoolOwnerController.createSchoolOwner
	}
];

export default routes;
