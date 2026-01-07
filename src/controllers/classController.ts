import { createSuccessResponse, createErrorResponse } from '../commons/responseHelpers';
import { MESSAGES } from '../commons/message';
import { Constants } from '../commons/constants';
import { classModel } from '../models';
import dbService from '../services/databaseService';
import { Types } from 'mongoose';
import { IRegexSearch } from '../commons/interfaces';
import { Utils } from '../utils/utils';

/**
 * Creates a new class.
 * @param payload - The payload containing the class details.
 * @param {string} payload.name - The name of the class.
 * @param {string} payload.schoolId - The ID of the school to which the class belongs.
 * @param {string} payload.description - The description of the class.
 * @param {number} payload.capacity - The capacity of the class.
 * @returns {Object} The created class.
 * @throws {Object} Error response if the class already exists or creation fails.
 */
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

/**
 * Updates a class.
 * @param payload - The payload containing the class details.
 * @param {string} payload.classId - The ID of the class to update.
 * @param {string} payload.name - The name of the class.
 * @param {string} payload.description - The description of the class.
 * @param {number} payload.capacity - The capacity of the class.
 * @returns {Object} The updated class.
 * @throws {Object} Error response if the class already exists or update fails.
 */
async function updateClass(payload: any) {
	const existingClass = await dbService.findOne(classModel, {
		_id: payload.classId,
		isDeleted: false
	});

	if (!existingClass) {
		throw createErrorResponse(MESSAGES.CLASS_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	if (payload.name && payload.name !== existingClass.name) {
		const duplicateClass = await dbService.findOne(classModel, {
			name: payload.name,
			isDeleted: false
		});

		if (duplicateClass) {
			throw createErrorResponse(MESSAGES.CLASS_ALREADY_EXISTS, Constants.ERROR_TYPES.ALREADY_EXISTS);
		}
	}

	await dbService.updateOne(
		classModel,
		{ _id: payload.classId },
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

/**
 * Gets classes by school.
 * @param payload - The payload containing the school ID and search criteria.
 * @param {string} payload.schoolId - The ID of the school to get classes for.
 * @param {string} payload.name - The name of the class to search for.
 * @returns {Object} The classes.
 * @throws {Object} Error response if the classes are not found.
 */
async function getClassesBySchool(payload: any) {
	const matchCriteria: {
		isDeleted: boolean;
		schoolId: Types.ObjectId;
		name?: IRegexSearch;
	} = {
		schoolId: payload.schoolId,
		isDeleted: false
	};
	if (payload.name) {
		matchCriteria.name = Utils.aggregateSearchRegex(payload.name);
	}

	const data = await dbService.aggregate(classModel, [
		{ $match: matchCriteria },
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

/**
 * Deletes a class.
 * @param payload - The payload containing the class IDs to delete.
 * @param {string[]} payload.classIds - The IDs of the classes to delete.
 * @returns {Object} The deleted class.
 * @throws {Object} Error response if the classes are not found or deletion fails.
 */
async function deleteClass(payload: any) {
	console.log('Deleting class with ID:', payload);
	const existingClasses = await dbService.count(classModel, {
		_id: { $in: payload.classIds },
		isDeleted: false
	});

	if (existingClasses !== payload.classIds.length) {
		throw createErrorResponse(payload.classIds.length > 1 ? MESSAGES.CLASSES_NOT_FOUND : MESSAGES.CLASS_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	await dbService.updateOne(classModel, { _id: { $in: payload.classIds } }, { $set: { isDeleted: true } });

	return createSuccessResponse(payload.schoolIds.length > 1 ? MESSAGES.CLASSES_DELETED : MESSAGES.CLASS_DELETED);
}

export const classController = {
	createClass,
	updateClass,
	getClassesBySchool,
	deleteClass
};
