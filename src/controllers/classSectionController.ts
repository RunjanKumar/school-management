import { createSuccessResponse, createErrorResponse } from '../commons/responseHelpers';
import { MESSAGES } from '../commons/message';
import { Constants } from '../commons/constants';
import { classSectionModel } from '../models';
import dbService from '../services/databaseService';
import { Types } from 'mongoose';

async function createClassSection(payload: any) {
	const existing = await dbService.findOne(classSectionModel, {
		name: payload.name,
		schoolId: payload.schoolId,
		classId: payload.classId,
		isDeleted: false
	});

	if (existing) {
		throw createErrorResponse(MESSAGES.CLASS_SECTION_ALREADY_EXISTS, Constants.ERROR_TYPES.ALREADY_EXISTS);
	}

	const created = await dbService.create(classSectionModel, {
		name: payload.name,
		classId: payload.classId,
		schoolId: payload.schoolId,
		sectionHeadTeacherId: payload.sectionHeadTeacherId,
		capacity: payload.capacity
	});

	return createSuccessResponse(MESSAGES.CLASS_SECTION_CREATED, { section: created });
}

async function updateClassSection(payload: any) {
	const existing = await dbService.findOne(classSectionModel, {
		_id: payload.classSectionId,
		schoolId: payload.schoolId,
		isDeleted: false
	});

	if (!existing) {
		throw createErrorResponse(MESSAGES.CLASS_SECTION_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	if (payload.name && payload.name !== existing.name) {
		const duplicate = await dbService.findOne(classSectionModel, {
			name: payload.name,
			classId: existing.classId,
			isDeleted: false
		});

		if (duplicate) {
			throw createErrorResponse(MESSAGES.CLASS_SECTION_ALREADY_EXISTS, Constants.ERROR_TYPES.ALREADY_EXISTS);
		}
	}

	const updateData: any = {};
	if (payload.name) updateData.name = payload.name;
	if (payload.capacity !== undefined) updateData.capacity = payload.capacity;
	if (payload.sectionHeadTeacherId) updateData.sectionHeadTeacherId = payload.sectionHeadTeacherId;

	await dbService.updateOne(classSectionModel, { _id: payload.classSectionId, schoolId: payload.schoolId }, { $set: updateData });

	return createSuccessResponse(MESSAGES.CLASS_SECTION_UPDATED);
}

async function getSectionsByClass(payload: any) {
	const match: any = {
		classId: new Types.ObjectId(payload.classId),
		schoolId: new Types.ObjectId(payload.schoolId),
		isDeleted: false
	};

	const data = await dbService.aggregate(classSectionModel, [
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
							classId: 1,
							capacity: 1,
							currentStrength: 1,
							sectionHeadTeacherId: 1,
							createdAt: 1
						}
					}
				],
				count: [ { $count: 'count' } ]
			}
		},
		{ $addFields: { count: { $ifNull: [ { $first: '$count.count' }, 0 ] } } }
	]);

	return createSuccessResponse(MESSAGES.CLASS_SECTIONS_FETCHED, {
		data: data[0]?.data ?? [],
		count: data[0]?.count ?? 0
	});
}

async function deleteClassSection(payload: any) {
	const existing = await dbService.count(classSectionModel, {
		_id: payload.classSectionId,
		schoolId: payload.schoolId,
		isDeleted: false
	});

	if (!existing) {
		throw createErrorResponse(MESSAGES.CLASS_SECTION_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	await dbService.updateOne(classSectionModel, { _id: payload.classSectionId, schoolId: payload.schoolId }, { $set: { isDeleted: true } });

	return createSuccessResponse(MESSAGES.CLASS_SECTION_DELETED);
}

export const classSectionController = {
	createClassSection,
	updateClassSection,
	getSectionsByClass,
	deleteClassSection
};
