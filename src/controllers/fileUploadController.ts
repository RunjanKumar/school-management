import path from 'path'; // path is not strictly needed here if not doing local file ops
import { createSuccessResponse, createErrorResponse } from '../commons/responseHelpers';
import { MESSAGES } from '../commons/message';
import { Constants } from '../commons/constants';
import { uploadFileToS3 } from '../services/fileUploadService'; // Ensure this path is correct

async function uploadFile(payload: any) {
	// console.log('Received file upload payload:', payload);
	// Add validation back for robust handling
	if (!payload.file || !Object.keys(payload.file).length) {
		throw createErrorResponse(MESSAGES.FILE_REQUIRED_IN_PAYLOAD, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	console.log('File upload payload:', payload);

	// Generate a unique file name for S3
	const originalFileName = payload.file.originalname;
	const fileExtention = path.extname(originalFileName); // Safer way to get extension
	const baseName = path.basename(originalFileName, fileExtention); // Get filename without extension
	const fileName = `${baseName}_${Date.now()}${fileExtention}`; // Example: myImage_16789012345.jpg

	let fileUrl = '';

	fileUrl = await uploadFileToS3(payload.file, fileName);

	return Object.assign(createSuccessResponse(MESSAGES.FILE_UPLOAD_SUCCESS), { fileUrl });
}

export const fileUploadController = {
	uploadFile
};

// Removed the 'uploadFile' function that handled local uploads from this controller,
// as the service is now focused on S3.
