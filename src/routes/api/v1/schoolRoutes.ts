import { schoolController } from '../../../controllers';
import joiUtils from '../../../utils/joiUtils';
import { Constants } from '../../../commons/constants';

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
				shortName: Joi.string().optional().description('Short name or abbreviation of the school'),
				logo: Joi.string().uri().optional().description('URL to the school\'s logo'),
				description: Joi.string().optional().description('A brief description of the school'),
				establishedYear: Joi.number().min(1800).max(new Date().getFullYear()).optional().description('Year the school was established'),

				email: Joi.string().email().lowercase().required().description('Email of the school'),
				contactNumber: Joi.string().required().description('Contact number of the school'),
				website: Joi.string().uri().optional().description('Website of the school'),

				address: Joi.object()
					.keys({
						addressLine1: Joi.string().required().description('First line of the school\'s address'),
						addressLine2: Joi.string().optional().description('Second line of the school\'s address'),
						landmark: Joi.string().optional().description('Landmark near the school'),
						city: Joi.string().required().description('City of the school'),
						state: Joi.string().required().description('State of the school'),
						zipcode: Joi.string().required().description('Zipcode of the school'),
						country: Joi.string().required().description('Country of the school'),
						coordinates: Joi.object()
							.keys({
								type: Joi.string().valid('Point').default('Point'),
								coordinates: Joi.array().items(Joi.number()).length(2).description('[longitude, latitude]')
							})
							.optional()
							.description('Geographical coordinates of the school')
					})
					.required()
					.description('Address information of the school'),

				// Fixed: Use ...Object.values() to spread the enum values as individual arguments to .valid()
				affiliatedSchoolBoard: Joi.string().mongoId().required().description('Affiliated school board ID'),
				mediumOfInstruction: Joi.array().items(Joi.string()).default([ 'English' ]).optional().description('Mediums of instruction (e.g., English, Hindi)'),
				// Fixed: Use ...Object.values() to spread the enum values as individual arguments to .valid()
				schoolType: Joi.number()
					.valid(...Object.values(Constants.SCHOOL_TYPES))
					.default(Constants.SCHOOL_TYPES.OTHER)
					.optional()
					.description('Type of school'),
				educationalLevels: Joi.array()
					.items(Joi.number().valid(...Object.values(Constants.EDUCATIONAL_LEVELS)))
					.required()
					.description('Educational levels offered by the school'),
				bannerImages: Joi.array().items(Joi.string().uri()).optional().description('URLs to banner images of the school')
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
				shortName: Joi.string().optional().description('Short name or abbreviation of the school'),
				logo: Joi.string().uri().optional().description('URL to the school\'s logo'),
				description: Joi.string().optional().description('A brief description of the school'),
				establishedYear: Joi.number().min(1800).max(new Date().getFullYear()).optional().description('Year the school was established'),

				email: Joi.string().email().lowercase().required().description('Email of the school'),
				contactNumber: Joi.string().phoneNumber().required().description('Contact number of the school'),
				website: Joi.string().uri().optional().description('Website of the school'),

				address: Joi.object()
					.keys({
						addressLine1: Joi.string().required().description('First line of the school\'s address'),
						addressLine2: Joi.string().optional().description('Second line of the school\'s address'),
						landmark: Joi.string().optional().description('Landmark near the school'),
						city: Joi.string().required().description('City of the school'),
						state: Joi.string().required().description('State of the school'),
						zipcode: Joi.string().required().description('Zipcode of the school'),
						country: Joi.string().required().description('Country of the school'),
						coordinates: Joi.object()
							.keys({
								type: Joi.string().valid('Point').default('Point'),
								coordinates: Joi.array().items(Joi.number()).length(2).description('[longitude, latitude]')
							})
							.optional()
							.description('Geographical coordinates of the school')
					})
					.required()
					.description('Address information of the school'),

				affiliatedSchoolBoard: Joi.string().mongoId().required().description('Affiliated school board ID'),
				mediumOfInstruction: Joi.array().items(Joi.string()).default([ 'English' ]).optional().description('Mediums of instruction (e.g., English, Hindi)'),
				schoolType: Joi.number()
					.valid(...Object.values(Constants.SCHOOL_TYPES))
					.default(Constants.SCHOOL_TYPES.OTHER)
					.optional()
					.description('Type of school'),
				educationalLevels: Joi.array()
					.items(Joi.number().valid(...Object.values(Constants.EDUCATIONAL_LEVELS)))
					.required()
					.description('Educational levels offered by the school'),
				bannerImages: Joi.array().items(Joi.string().uri()).optional().description('URLs to banner images of the school')
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
				schoolId: Joi.string().mongoId().optional().description('School ID'),
				skip: Joi.number().min(0).default(0).description('Skip number'),
				limit: Joi.number().min(1).default(10).description('Limit per page'),
				sortKey: Joi.string().valid('createdAt', 'name', 'email', 'contactNumber').default('createdAt').description('Sort by'),
				sortOrder: Joi.number().valid(1, -1).default(-1).description('Sort order'),
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
				schoolIds: Joi.array().items(Joi.string().mongoId()).min(1).required().description('School IDs')
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
