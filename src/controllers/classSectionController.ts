import { createSuccessResponse, createErrorResponse } from '../commons/responseHelpers';
import { MESSAGES } from '../commons/message';
import { Constants } from '../commons/constants';
import { classSectionModel } from '../models';
import dbService from '../services/databaseService';
import { Types } from 'mongoose';

async function createClassSection(payload: any) {
	const existing = await dbService.findOne(classSectionModel, {
		name: payload.name,
		classId: payload.classId,
		isDeleted: false
	});

	if (existing) {
		throw createErrorResponse(MESSAGES.CLASS_SECTION_ALREADY_EXISTS, Constants.ERROR_TYPES.ALREADY_EXISTS);
	}

	const created = await dbService.create(classSectionModel, {
		name: payload.name,
		classId: payload.classId,
		sectionHeadTeacherId: payload.sectionHeadTeacherId,
		capacity: payload.capacity
	});

	return createSuccessResponse(MESSAGES.CLASS_SECTION_CREATED, { section: created });
}

async function updateClassSection(payload: any) {
	const existing = await dbService.findOne(classSectionModel, {
		_id: payload.classSectionId,
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

	await dbService.updateOne(classSectionModel, { _id: payload.classSectionId, isDeleted: false }, { $set: updateData });

	return createSuccessResponse(MESSAGES.CLASS_SECTION_UPDATED);
}

async function getSectionsByClass(payload: any) {
	const match: any = {
		classId: new Types.ObjectId(payload.classId),
		isDeleted: false
	};

	if (payload.name) {
		match.name = { $regex: payload.name, $options: 'i' }; // Case-insensitive search
	}

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
		_id: { $in: payload.classSectionIds },
		isDeleted: false
	});

	if (existing !== payload.classSectionIds.length) {
		throw createErrorResponse(payload.classSectionIds.length > 1 ? MESSAGES.CLASS_SECTIONS_NOT_FOUND : MESSAGES.CLASS_SECTION_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	await dbService.updateOne(classSectionModel, { _id: { $in: payload.classSectionIds } }, { $set: { isDeleted: true } });

	return createSuccessResponse(payload.schoolIds.length > 1 ? MESSAGES.CLASS_SECTIONS_DELETED : MESSAGES.CLASS_SECTION_DELETED);
}

export const classSectionController = {
	createClassSection,
	updateClassSection,
	getSectionsByClass,
	deleteClassSection
};
