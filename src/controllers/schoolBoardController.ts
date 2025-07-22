import { createSuccessResponse, createErrorResponse } from '../commons/responseHelpers';
import { MESSAGES } from '../commons/message';
import { Constants } from '../commons/constants';
import schoolBoardModel from '../models/schoolBoardModel';
import dbService from '../services/databaseService';
import { Types } from 'mongoose';

/**
 * Create a new school board
 * @param {Object} payload - The payload containing the school board details
 * @param {string} payload.name - The name of the school board
 * @param {number} payload.type - The type of the school board
 * @returns The created school board
 */
async function createSchoolBoard(payload: any) {
	// check that school board does not already exist
	const existingBoard = await dbService.findOne(schoolBoardModel, {
		name: payload.name,
		isDeleted: false
	});

	if (existingBoard) {
		throw createErrorResponse(MESSAGES.SCHOOL_BOARD_ALREADY_EXISTS, Constants.ERROR_TYPES.BAD_REQUEST);
	}
	const board = await dbService.create(schoolBoardModel, {
		name: payload.name,
		type: payload.type
	});

	return createSuccessResponse(MESSAGES.SCHOOL_BOARD_CREATED, { board });
}

/**
 * Update a school board
 * @param {Object} payload - The payload containing the school board details
 * @param {string} payload.schoolBoardId - The ID of the school board to update
 * @param {string} payload.name - The name of the school board
 * @param {number} payload.type - The type of the school board
 * @returns The updated school board
 */
async function updateSchoolBoard(payload: any) {
	// check that school exists
	const schoolBoard = await dbService.findOne(schoolBoardModel, {
		_id: payload.schoolBoardId,
		isDeleted: false
	});

	if (!schoolBoard) {
		throw createErrorResponse(MESSAGES.SCHOOL_BOARD_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	if (payload.name !== schoolBoard.name) {
		const existingBoard = await dbService.findOne(schoolBoardModel, {
			name: payload.name,
			isDeleted: false
		});

		if (existingBoard) {
			throw createErrorResponse(MESSAGES.SCHOOL_BOARD_ALREADY_EXISTS, Constants.ERROR_TYPES.BAD_REQUEST);
		}
	}

	await dbService.updateOne(
		schoolBoardModel,
		{ _id: schoolBoard._id },
		{
			name: payload.name,
			type: payload.type
		},
		{ new: true }
	);

	return createSuccessResponse(MESSAGES.SCHOOL_BOARD_UPDATED);
}

/**
 * Get all school boards
 * @param {Object} payload - The payload containing the search criteria
 * @param {string} payload.schoolBoardId - The ID of the school board to search for
 * @param {number} payload.type - The type of the school board to search for
 * @param {string} payload.searchString - The search string to filter the school boards
 * @param {string} payload.sortKey - The key to sort the school boards
 * @param {string} payload.sortDirection - The direction to sort the school boards
 * @param {number} payload.skip - The number of school boards to skip
 * @param {number} payload.limit - The number of school boards to return
 * @returns The list of school boards
 */
async function getSchoolBoards(payload: any) {
	const matchCriteria: Record<string, boolean | Types.ObjectId | { $regex: string; $options: string }> = {
		isDeleted: false
	};

	if (payload.schoolBoardId) {
		matchCriteria._id = payload.schoolBoardId;
	}

	if (payload.type) {
		matchCriteria.type = payload.type;
	}

	if (payload.searchString) {
		matchCriteria.name = { $regex: payload.searchString, $options: 'i' };
	}

	const boards = await dbService.aggregate(schoolBoardModel, [
		{ $match: matchCriteria },
		{
			$facet: {
				data: [
					{ $sort: { [payload.sortKey]: payload.sortDirection } },
					{ $skip: payload.skip },
					{ $limit: payload.limit },
					{
						$project: {
							_id: 1,
							name: 1,
							type: 1,
							createdAt: 1
						}
					}
				],
				count: [ { $count: 'count' } ]
			}
		},
		{ $addFields: { count: { $ifNull: [ { $first: '$count.count' }, 0 ] } } }
	]);

	return createSuccessResponse(MESSAGES.SCHOOL_BOARDS_FETCHED, {
		data: boards[0]?.data ?? [],
		count: boards[0]?.count ?? 0
	});
}

/**
 * Delete a school board
 * @param {Object} payload - The payload containing the school board IDs
 * @param {string[]} payload.schoolBoardIds - The IDs of the school boards to delete
 * @returns The deleted school board
 */
async function deleteSchoolBoard(payload: any) {
	const existingBoardsCount = await dbService.count(schoolBoardModel, {
		_id: { $in: payload.schoolBoardIds },
		isDeleted: false
	});

	if (existingBoardsCount !== payload.schoolBoardIds.length) {
		throw createErrorResponse(payload.schoolBoardIds.length === 1 ? MESSAGES.SCHOOL_BOARD_NOT_FOUND : MESSAGES.SCHOOL_BOARDS_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	await dbService.updateMany(schoolBoardModel, { _id: { $in: payload.schoolBoardIds } }, { isDeleted: true });

	return createSuccessResponse(MESSAGES.SCHOOL_BOARD_DELETED);
}

export const schoolBoardController = {
	createSchoolBoard,
	getSchoolBoards,
	updateSchoolBoard,
	deleteSchoolBoard
};
