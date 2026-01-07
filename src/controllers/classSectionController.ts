import { createSuccessResponse, createErrorResponse } from '../commons/responseHelpers';
import { MESSAGES } from '../commons/message';
import { Constants } from '../commons/constants';
import { classSectionModel } from '../models';
import dbService from '../services/databaseService';
import { Types } from 'mongoose';
import { IClassSection } from '../models';
import { IRegexSearch } from '../commons/interfaces';
import { Utils } from '../utils/utils';

/**
 * Creates a new class section
 * @param payload - Request payload containing class section creation details
 * @param {string} payload.name - Name of the class section
 * @param {string} payload.classId - ID of the class to which the section belongs
 * @param {string} payload.schoolId - ID of the school to which the section belongs
 * @param {string} payload.sectionHeadTeacherId - ID of the section head teacher
 * @param {number} payload.capacity - Maximum capacity of the section
 * @returns {Object} Success response indicating class section was created
 * @throws {Object} Error response if class section already exists or creation fails
 */
async function createClassSection(payload: any) {
	const existingClassSection: IClassSection | null = await dbService.findOne(classSectionModel, {
		name: payload.name,
		classId: payload.classId,
		schoolId: payload.schoolId,
		isDeleted: false
	});

	if (existingClassSection) {
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

/**
 * Updates an existing class section's information
 * @param {Object} payload - Request payload containing class section update details
 * @param {string} payload.classSectionId - ID of the class section to update
 * @param {string} [payload.name] - Updated section name (optional, must be unique within class)
 * @param {number} [payload.capacity] - Updated capacity (optional)
 * @param {string} [payload.sectionHeadTeacherId] - Updated head teacher ID (optional)
 * @returns {Object} Success response indicating class section was updated
 * @throws {Object} Error response if class section not found or duplicate name/capacity/head teacher
 */
async function updateClassSection(payload: any) {
	const existingClassSection: IClassSection | null = await dbService.findOne(classSectionModel, {
		_id: payload.classSectionId,
		isDeleted: false
	});

	if (!existingClassSection) {
		throw createErrorResponse(MESSAGES.CLASS_SECTION_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	if (payload.name && payload.name !== existingClassSection.name) {
		const duplicateClassSection: IClassSection | null = await dbService.findOne(classSectionModel, {
			name: payload.name,
			classId: existingClassSection.classId,
			isDeleted: false
		});

		if (duplicateClassSection) {
			throw createErrorResponse(MESSAGES.CLASS_SECTION_ALREADY_EXISTS, Constants.ERROR_TYPES.ALREADY_EXISTS);
		}
	}

	const updateData: {
		name?: string;
		capacity?: number;
		sectionHeadTeacherId?: Types.ObjectId;
	} = {};

	if (payload.name) updateData.name = payload.name;
	if (payload.capacity !== undefined) updateData.capacity = payload.capacity;
	if (payload.sectionHeadTeacherId) updateData.sectionHeadTeacherId = payload.sectionHeadTeacherId;

	await dbService.updateOne(classSectionModel, { _id: payload.classSectionId, isDeleted: false }, { $set: updateData });

	return createSuccessResponse(MESSAGES.CLASS_SECTION_UPDATED);
}

/**
 * Retrieves all sections of a class with optional filtering and pagination
 * @param {Object} payload - Request payload containing class section retrieval details
 * @param {string} payload.classId - ID of the class to fetch sections for
 * @param {string} [payload.name] - Optional section name to filter by (case-insensitive regex)
 * @param {string} [payload.sortKey] - Key to sort results by (default: 'createdAt')
 * @param {number} [payload.sortDirection] - Sort direction (-1 for descending, 1 for ascending)
 * @param {number} [payload.skip] - Number of documents to skip (for pagination)
 * @param {number} [payload.limit] - Maximum number of documents to return (for pagination)
 * @returns {Object} Success response containing array of class sections and total count
 * @throws {Object} Error response if class not found or retrieval fails
 */
async function getSectionsByClass(payload: any) {
	const matchCriteria: {
		isDeleted: boolean;
		classId: Types.ObjectId;
		name?: IRegexSearch;
	} = {
		classId: payload.classId,
		isDeleted: false
	};

	if (payload.name) {
		matchCriteria.name = Utils.aggregateSearchRegex(payload.name);
	}

	const data = await dbService.aggregate(classSectionModel, [
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

/**
 * Soft deletes one or more class sections by setting isDeleted flag to true
 * @param {Object} payload - Request payload containing class section deletion details
 * @param {Array<string>} payload.classSectionIds - Array of class section IDs to delete
 * @returns {Object} Success response indicating class sections were deleted
 * @throws {Object} Error response if class sections not found or deletion fails
 */
async function deleteClassSection(payload: any) {
	const existingCount = await dbService.count(classSectionModel, {
		_id: { $in: payload.classSectionIds },
		isDeleted: false
	});

	if (existingCount !== payload.classSectionIds.length) {
		throw createErrorResponse(payload.classSectionIds.length > 1 ? MESSAGES.CLASS_SECTIONS_NOT_FOUND : MESSAGES.CLASS_SECTION_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	await dbService.updateOne(classSectionModel, { _id: { $in: payload.classSectionIds } }, { $set: { isDeleted: true } });

	return createSuccessResponse(payload.classSectionIds.length > 1 ? MESSAGES.CLASS_SECTIONS_DELETED : MESSAGES.CLASS_SECTION_DELETED);
}

export const classSectionController = {
	createClassSection,
	updateClassSection,
	getSectionsByClass,
	deleteClassSection
};
