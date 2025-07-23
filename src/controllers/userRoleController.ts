import { createSuccessResponse, createErrorResponse } from '../commons/responseHelpers';
import { MESSAGES } from '../commons/message';
import { Constants } from '../commons/constants';
import { schoolModel, userRoleModel } from '../models';
import dbService from '../services/databaseService';
import { UserRoleSchoolPermissions } from '../interfaces';
import { Types } from 'mongoose';

/**
 * Creates a new user role
 * @param {Object} payload - The payload containing the user role details
 * @param {string} payload.name - The name of the user role
 * @param {Array<Object>} payload.schoolPermissions - The school permissions for the user role
 * @param {string} payload.schoolPermissions[].schoolId - The ID of the school
 * @param {Array<string>} payload.schoolPermissions[].permissions - The permissions for the user role
 * @returns {Object} The created user role
 */
async function createUserRole(payload: any) {
	const existingUserRole = await dbService.findOne(userRoleModel, {
		name: payload.name,
		isDeleted: false
	});

	if (existingUserRole) {
		throw createErrorResponse(MESSAGES.USER_ROLE_ALREADY_EXISTS, Constants.ERROR_TYPES.ALREADY_EXISTS);
	}

	// Validate schoolPermissions
	const existingSchools = await dbService.count(schoolModel, {
		_id: { $in: payload.schoolPermissions.map((permission: UserRoleSchoolPermissions) => permission.schoolId) },
		isDeleted: false
	});

	if (existingSchools !== payload.schoolPermissions.length) {
		throw createErrorResponse(payload.schoolPermissions.length === 1 ? MESSAGES.SCHOOL_NOT_FOUND : MESSAGES.SCHOOLS_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	const role = await dbService.create(userRoleModel, {
		name: payload.name,
		schoolPermissions: payload.schoolPermissions
	});

	return createSuccessResponse(MESSAGES.USER_ROLE_CREATED, { role });
}

/**
 * Updates a user role
 * @param {Object} payload - The payload containing the user role details
 * @param {string} payload.userRoleId - The ID of the user role
 * @param {string} payload.name - The name of the user role
 * @param {Array<Object>} payload.schoolPermissions - The school permissions for the user role
 * @param {string} payload.schoolPermissions[].schoolId - The ID of the school
 * @param {Array<string>} payload.schoolPermissions[].permissions - The permissions for the user role
 * @returns {Object} The updated user role
 */
async function updateUserRole(payload: any) {
	const role = await dbService.findOne(userRoleModel, {
		_id: payload.userRoleId,
		isDeleted: false
	});
	if (!role) {
		throw createErrorResponse(MESSAGES.USER_ROLE_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	if (payload.name && payload.name !== role.name) {
		const existing = await dbService.findOne(userRoleModel, {
			name: payload.name,
			isDeleted: false
		});
		if (existing) {
			throw createErrorResponse(MESSAGES.USER_ROLE_ALREADY_EXISTS, Constants.ERROR_TYPES.ALREADY_EXISTS);
		}
	}

	// Validate schoolPermissions
	const existingSchools = await dbService.count(schoolModel, {
		_id: { $in: payload.schoolPermissions.map((permission: UserRoleSchoolPermissions) => permission.schoolId) },
		isDeleted: false
	});

	if (existingSchools !== payload.schoolPermissions.length) {
		throw createErrorResponse(payload.schoolPermissions.length === 1 ? MESSAGES.SCHOOL_NOT_FOUND : MESSAGES.SCHOOLS_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	await dbService.updateOne(
		userRoleModel,
		{ _id: payload.userRoleId },
		{
			$set: {
				name: payload.name,
				schoolPermissions: payload.schoolPermissions
			}
		}
	);

	return createSuccessResponse(MESSAGES.USER_ROLE_UPDATED);
}

/**
 * Gets user roles (with optional search, pagination)
 * @param {Object} payload - The payload containing the user role details
 * @param {string} payload.userRoleId - The ID of the user role
 * @param {string} payload.searchString - The search string
 * @param {string} payload.sortKey - The key to sort by
 * @param {string} payload.sortDirection - The direction to sort by
 * @param {number} payload.skip - The number of user roles to skip
 * @param {number} payload.limit - The number of user roles to return
 * @returns {Object} The user roles
 */
async function getUserRoles(payload: any) {
	const matchCriteria: Record<string, boolean | Types.ObjectId | { $regex: string; $options: string }> = { isDeleted: false };

	if (payload.userRoleId) {
		matchCriteria._id = payload.userRoleId;
	}

	if (payload.searchString) {
		matchCriteria.name = { $regex: payload.searchString, $options: 'i' };
	}

	const data = await dbService.aggregate(userRoleModel, [
		{ $match: matchCriteria },
		{
			$facet: {
				data: [
					{ $sort: { [payload.sortKey]: payload.sortDirection } },
					{ $skip: payload.skip },
					{ $limit: payload.limit },
					...(payload.userRoleId
						? [
							{
								$lookup: {
									from: 'schools',
									let: {
										schoolIds: '$schoolPermissions.schoolId'
									},
									pipeline: [
										{ $match: { $expr: { $in: [ '$_id', '$$schoolIds' ] } } },
										{
											$project: {
												_id: 1,
												name: 1
											}
										}
									],
									as: 'schoolPermissionsSchool'
								}
							}
						]
						: []),
					{
						$project: {
							_id: 1,
							name: 1,
							...(payload.userRoleId
								? {
									schoolPermissions: {
										$map: {
											input: '$schoolPermissionsSchool',
											as: 'school',
											in: {
												schoolId: '$$school._id',
												schoolName: '$$school.name',
												permissions: { $arrayElemAt: [ '$schoolPermissions.permissions', { $indexOfArray: [ '$schoolPermissions.schoolId', '$$school._id' ] } ] }
											}
										}
									}
								}
								: {}),
							createdAt: 1
						}
					}
				],
				count: [ { $count: 'count' } ]
			}
		},
		{ $addFields: { count: { $ifNull: [ { $first: '$count.count' }, 0 ] } } }
	]);

	return createSuccessResponse(MESSAGES.USER_ROLES_FETCHED, {
		data: data[0]?.data ?? [],
		count: data[0]?.count ?? 0
	});
}

/**
 * Deletes user roles
 * @param {Object} payload - The payload containing the user role details
 * @param {Array<string>} payload.userRoleIds - The IDs of the user roles to delete
 * @returns {Object} The deleted user roles
 */
async function deleteUserRoles(payload: any) {
	const roles = await dbService.count(userRoleModel, {
		_id: { $in: payload.userRoleIds },
		isDeleted: false
	});

	if (roles !== payload.userRoleIds.length) {
		throw createErrorResponse(payload.userRoleIds.length === 1 ? MESSAGES.USER_ROLE_NOT_FOUND : MESSAGES.USER_ROLES_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	await dbService.updateMany(userRoleModel, { _id: { $in: payload.userRoleIds } }, { $set: { isDeleted: true } });

	return createSuccessResponse(payload.userRoleIds.length === 1 ? MESSAGES.USER_ROLE_DELETED : MESSAGES.USER_ROLES_DELETED);
}

export const userRoleController = {
	createUserRole,
	getUserRoles,
	updateUserRole,
	deleteUserRoles
};
