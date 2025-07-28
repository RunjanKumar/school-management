'use strict';

import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import CONFIG from '../config';
import { ObjectId } from 'mongoose';
import { createErrorResponse } from '../commons/responseHelpers';
import { MESSAGES } from '../commons/message';
import { Constants } from '../commons/constants';

interface FilePayload {
	fieldname: string;
	originalname: string;
	encoding: string;
	mimetype: string;
	buffer: Buffer;
	size: number;
}

/**
 * Upload file to local storage.
 */
export const uploadFileToLocal = async (readableFile: any, filePath: any, pathToUpload: any): Promise<Record<string, string>> => {
	if (!fs.existsSync(pathToUpload)) {
		fs.mkdirSync(pathToUpload, { recursive: true });
	}

	const fullFilePath = path.join(pathToUpload, path.basename(filePath));
	const fileWriteStream = fs.createWriteStream(fullFilePath);
	return new Promise((resolve, reject) => {
		fileWriteStream.write(readableFile.buffer);
		fileWriteStream.end((err: any) => {
			if (err) {
				console.log('File upload failed: ', err);
				reject(createErrorResponse(MESSAGES.FILE_UPLOAD_FAILED, Constants.ERROR_TYPES.BAD_REQUEST));
			} else {
				// As api gateway will only forward when file is added.
				const fileUrl = `${CONFIG.SERVER_URL}/${filePath}`;
				resolve({ filePath: fullFilePath, fileUrl });
			}
		});
	});
};

/**
 * Function to upload multiple files.
 * @param files - array of files
 * @param userId - user id
 * @returns array of file paths
 */
export const uploadManyFiles = async (files: any, userId: string | ObjectId) => {
	const uploadedFiles = [];
	for (const file of files) {
		const fileName = `${userId.toString()}_${Date.now()}_${file.originalname}`;
		const relativePath = `public/userFiles/${fileName}`;
		const basePath = path.join(__dirname, '../../public/userFiles');
		const filePath = await uploadFileToLocal(file, relativePath, basePath);
		uploadedFiles.push(filePath);
	}

	return uploadedFiles;
};

/**
 * Fuction to format file details before uploading on server.
 * @param {*} payload
 * @returns
 */
export const uploadFile = async (payload: any): Promise<Record<string, string>> => {
	const fileNameArray = payload.file.originalname.split('.');
	const fileExtention = fileNameArray[fileNameArray.length - 1];
	const filePath = CONFIG.PATH_TO_UPLOAD_FILES_ON_LOCAL_SERVER;
	const fileName = `${Date.now()}_${fileNameArray.filter((ele: any) => ele !== fileExtention).join('_')}.${fileExtention}`;

	return await uploadFileToLocal(payload.file, fileName, filePath);
};

// AWS S3 Client Setup using v3 SDK
// This replaces the AWS.config.update and direct AWS.S3 instantiation for the S3 bucket.
const s3Client = new S3Client({
	region: CONFIG.S3_BUCKET.region,
	credentials: {
		accessKeyId: CONFIG.S3_BUCKET.accessKeyId,
		secretAccessKey: CONFIG.S3_BUCKET.secretAccessKey
	}
});

console.log('AWS S3 Config (v3 Client Initialized for region):', CONFIG.S3_BUCKET.region);

export const uploadFileToS3 = async (payload: FilePayload, fileName: string): Promise<string> => {
	const bucketName = CONFIG.S3_BUCKET.bucketName;
	console.log('Uploading file to S3 bucket:', bucketName, 'with file name:', payload);
	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: fileName,
		Body: payload.buffer,
		ContentType: payload.mimetype
		// ACL: 'public-read', // Uncomment if you need public-read access. Be cautious.
	});

	try {
		const data = await s3Client.send(command); // Execute the command

		console.log('S3 PutObjectCommand Success:', data);

		const cloudFrontBaseUrl = process.env.CLOUD_FRONT_URL;
		let imageUrl: string;

		if (cloudFrontBaseUrl) {
			imageUrl = `${cloudFrontBaseUrl}/${fileName}`; // Use fileName as the key for CloudFront URL
		} else {
			// Fallback to S3 object URL if CloudFront URL is not available
			// Note: PutObjectCommand result does NOT directly return Location like v2 upload() or v3 lib-storage
			// You have to construct it from the bucket name, region, and key.
			imageUrl = `https://${bucketName}.s3.${CONFIG.S3_BUCKET.region}.amazonaws.com/${fileName}`;
		}

		return imageUrl;
	} catch (err) {
		console.error('S3 PutObjectCommand Error:', err);
		throw err; // Re-throw the error for the calling function to handle
	}
};
