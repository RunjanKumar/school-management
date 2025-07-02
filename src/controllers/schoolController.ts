import { Constants } from '../commons/constants';
import { schoolModel } from '../models';
import dbService from '../services/databaseService';
import { createErrorResponse, createSuccessResponse } from '../commons/responseHelpers';

async function createSchool(payload: any) {
	const school = await dbService.create(schoolModel, {
		name: payload.name,
		website: payload.website,
		email: payload.email,
		contactNumber: payload.contactNumber,
		address: payload.address,
		schoolOwnerId: payload.schoolOwner._id
	});

	return createSuccessResponse(Constants.RESPONSE_MESSAGES.SCHOOL_CREATED, { school });
}

async function getSchools(payload: any) {
	const matchCriteria: Record<string, boolean | Record<string, Record<string, string>>[]> = { isDeleted: false };

	if (payload.searchString) {
		matchCriteria.$or = [ { name: { $regex: payload.searchString, $options: 'i' } }, { email: { $regex: payload.searchString, $options: 'i' } }, { contactNumber: { $regex: payload.searchString, $options: 'i' } } ];
	}

	const schools = await dbService.aggregate(schoolModel, [
		{ $match: matchCriteria },
		{
			$facet: {
				data: [ { $sort: { [payload.sortKey]: payload.sortOrder } }, { $skip: payload.skip }, { $limit: payload.limit } ],
				count: [ { $count: 'count' } ]
			}
		},
		{ $addFields: { count: { $ifNull: [ { $first: '$count.count' }, 0 ] } } }
	]);

	return createSuccessResponse(Constants.RESPONSE_MESSAGES.SCHOOLS_FETCHED, {
		data: schools[0]?.data ?? [],
		count: schools[0]?.count ?? 0
	});
}

async function deleteSchools(payload: any) {
	const existingSchools = await dbService.count(schoolModel, {
		_id: { $in: payload.schoolIds },
		schoolOwnerId: payload.schoolOwner._id,
		isDeleted: false
	});

	if (existingSchools !== payload.schoolIds.length) {
		throw createErrorResponse(payload.schoolIds.length ? Constants.RESPONSE_MESSAGES.SCHOOLS_NOT_FOUND : Constants.RESPONSE_MESSAGES.SCHOOL_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	await dbService.updateMany(
		schoolModel,
		{
			_id: { $in: payload.schoolIds },
			schoolOwnerId: payload.schoolOwner._id
		},
		{ $set: { isDeleted: true } }
	);

	return createSuccessResponse(payload.schoolIds.length ? Constants.RESPONSE_MESSAGES.SCHOOLS_DELETED : Constants.RESPONSE_MESSAGES.SCHOOL_DELETED);
}

export const schoolController = {
	createSchool,
	getSchools,
	deleteSchools
};
