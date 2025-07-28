import { Constants } from '../../../commons/constants';
import { fileUploadController } from '../../../controllers';
import joiUtils from '../../../utils/joiUtils';

const Joi = joiUtils.Joi;

const routes: any = [
	{
		method: 'POST',
		path: '/v1/file/upload',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('User\'s JWT token.')
			},
			formData: {
				file: Joi.file({ name: 'media', description: 'Single image file' })
			},
			group: 'File',
			description: 'Route to upload image',
			model: 'UploadFiles'
		},
		auth: Constants.AVAILABLE_AUTHS.ADMIN_AND_SCHOOL_OWNER,
		handler: fileUploadController.uploadFile
	}
];

export default routes;
