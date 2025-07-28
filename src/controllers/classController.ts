import { createSuccessResponse, createErrorResponse } from '../commons/responseHelpers';
import { MESSAGES } from '../commons/message';
import { Constants } from '../commons/constants';
import { classModel } from '../models';
import dbService from '../services/databaseService';
import { Types } from 'mongoose';

async function createClass(payload: any) {
	const existingClass = await dbService.findOne(classModel, {
		name: payload.name,
		schoolId: payload.schoolId,
		isDeleted: false
	});

	if (existingClass) {
		throw createErrorResponse(MESSAGES.CLASS_ALREADY_EXISTS, Constants.ERROR_TYPES.ALREADY_EXISTS);
	}

	const createdClass = await dbService.create(classModel, {
		name: payload.name,
		schoolId: payload.schoolId,
		description: payload.description || '',
		capacity: payload.capacity
	});

	return createSuccessResponse(MESSAGES.CLASS_CREATED, { class: createdClass });
}

async function updateClass(payload: any) {
	const existingClass = await dbService.findOne(classModel, {
		_id: payload.classId,
		schoolId: payload.schoolId,
		isDeleted: false
	});

	if (!existingClass) {
		throw createErrorResponse(MESSAGES.CLASS_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	if (payload.name && payload.name !== existingClass.name) {
		const duplicateClass = await dbService.findOne(classModel, {
			name: payload.name,
			schoolId: existingClass.schoolId,
			isDeleted: false
		});

		if (duplicateClass) {
			throw createErrorResponse(MESSAGES.CLASS_ALREADY_EXISTS, Constants.ERROR_TYPES.ALREADY_EXISTS);
		}
	}

	await dbService.updateOne(
		classModel,
		{ _id: payload.classId, schoolId: payload.schoolId },
		{
			$set: {
				name: payload.name,
				description: payload.description,
				capacity: payload.capacity
			}
		}
	);

	return createSuccessResponse(MESSAGES.CLASS_UPDATED);
}

async function getClassesBySchool(payload: any) {
	const match: any = {
		schoolId: new Types.ObjectId(payload.schoolId),
		isDeleted: false
	};

	const data = await dbService.aggregate(classModel, [
		{ $match: match },
		{
			$facet: {
				data: [
					{ $sort: { [payload.sortKey || 'createdAt']: payload.sortDirection || -1 } },
					{ $skip: payload.skip || 0 },
					{ $limit: payload.limit || 50 },
					{
						$project: {
							_id: 1,
							name: 1,
							schoolId: 1,
							description: 1,
							capacity: 1,
							createdAt: 1
						}
					}
				],
				count: [ { $count: 'count' } ]
			}
		},
		{ $addFields: { count: { $ifNull: [ { $first: '$count.count' }, 0 ] } } }
	]);

	return createSuccessResponse(MESSAGES.CLASSES_FETCHED, {
		data: data[0]?.data ?? [],
		count: data[0]?.count ?? 0
	});
}

async function deleteClass(payload: any) {
	console.log('Deleting class with ID:', payload);
	const existingClass = await dbService.count(classModel, {
		_id: payload.classId,
		schoolId: payload.schoolId,
		isDeleted: false
	});

	if (!existingClass) {
		throw createErrorResponse(MESSAGES.CLASS_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	await dbService.updateOne(classModel, { _id: payload.classId, schoolId: payload.schoolId }, { $set: { isDeleted: true } });

	return createSuccessResponse(MESSAGES.CLASS_DELETED);
}

export const classController = {
	createClass,
	updateClass,
	getClassesBySchool,
	deleteClass
};
