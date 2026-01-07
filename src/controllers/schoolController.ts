import { Constants } from '../commons/constants';
import { MESSAGES } from '../commons/message';
import { schoolModel, schoolBoardModel, schoolMediumModel, schoolEducationLevelModel, ISchool } from '../models';
import dbService from '../services/databaseService';
import { createErrorResponse, createSuccessResponse } from '../commons/responseHelpers';
import { Types } from 'mongoose';
import { IRegexSearch } from '../commons/interfaces';
import { Utils } from '../utils/utils';

/**
 * Creates a new school in the system
 * @param {Object} payload - Request payload containing school details
 * @param {string} payload.name - Name of the school
 * @param {string} payload.website - Website URL of the school
 * @param {string} payload.email - Email address of the school
 * @param {string} payload.contactNumber - Contact number of the school
 * @param {string} payload.address - Address of the school
 * @param {Object} payload.schoolOwner - School owner object containing _id
 * @param {string} payload.schoolOwner._id - ID of the school owner
 * @returns {Object} Success response with created school data
 * @throws {Object} Error response if school creation fails
 */
async function createSchool(payload: any) {
	// Validate affiliatedSchoolBoard
	const schoolBoard = await dbService.findOne(schoolBoardModel, {
		_id: payload.affiliatedSchoolBoard,
		isDeleted: false
	});
	if (!schoolBoard) {
		throw createErrorResponse(MESSAGES.SCHOOL_BOARD_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	// Validate mediumOfInstruction
	const mediums = await dbService.find(schoolMediumModel, {
		_id: { $in: payload.mediumOfInstruction },
		isDeleted: false
	});
	if (mediums.length !== payload.mediumOfInstruction.length) {
		throw createErrorResponse(payload.mediumOfInstruction.length === 1 ? MESSAGES.SCHOOL_MEDIUM_NOT_FOUND : MESSAGES.SCHOOL_MEDIUMS_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	// Validate educationalLevels
	const levels = await dbService.find(schoolEducationLevelModel, {
		_id: { $in: payload.educationalLevels },
		isDeleted: false
	});
	if (levels.length !== payload.educationalLevels.length) {
		throw createErrorResponse(payload.educationalLevels.length === 1 ? MESSAGES.SCHOOL_EDUCATION_LEVEL_NOT_FOUND : MESSAGES.SCHOOL_EDUCATION_LEVELS_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	const schoolData = {
		name: payload.name,
		shortName: payload.shortName,
		logo: payload.logo,
		description: payload.description,
		establishedYear: payload.establishedYear,
		email: payload.email,
		contactNumber: payload.contactNumber,
		website: payload.website,
		address: payload.address,
		affiliatedSchoolBoard: payload.affiliatedSchoolBoard,
		mediumOfInstruction: payload.mediumOfInstruction,
		educationalLevels: payload.educationalLevels,
		schoolType: payload.schoolType,
		bannerImages: payload.bannerImages,
		schoolOwnerId: payload.schoolOwner._id
	};

	const school = await dbService.create(schoolModel, schoolData);

	return createSuccessResponse(MESSAGES.SCHOOL_CREATED, { school });
}

/**
 * Updates an existing school's information
 * @param {Object} payload - Request payload containing school update details
 * @param {string} payload.schoolId - ID of the school to update
 * @param {string} [payload.name] - Updated name of the school (optional)
 * @param {string} [payload.website] - Updated website URL of the school (optional)
 * @param {string} [payload.email] - Updated email address of the school (optional)
 * @param {string} [payload.contactNumber] - Updated contact number of the school (optional)
 * @param {string} [payload.address] - Updated address of the school (optional)
 * @returns {Object} Success response indicating school was updated
 * @throws {Object} Error response if school update fails or school not found
 */
async function updateSchool(payload: any) {
	const existingSchool = await dbService.findOne(schoolModel, { _id: payload.schoolId });
	if (!existingSchool) {
		throw createErrorResponse(MESSAGES.SCHOOL_NOT_FOUND, Constants.ERROR_TYPES.DATA_NOT_FOUND);
	}

	const updateToData: Partial<ISchool> = {};

	// Validate affiliatedSchoolBoard
	if (payload.hasOwnProperty('affiliatedSchoolBoard') && String(payload.affiliatedSchoolBoard) !== String(existingSchool.affiliatedSchoolBoard)) {
		const schoolBoard = await dbService.findOne(schoolBoardModel, {
			_id: payload.affiliatedSchoolBoard,
			isDeleted: false
		});
		if (!schoolBoard) {
			throw createErrorResponse(MESSAGES.SCHOOL_BOARD_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
		}
		updateToData.affiliatedSchoolBoard = payload.affiliatedSchoolBoard;
	}

	// Validate mediumOfInstruction
	if (payload.hasOwnProperty('mediumOfInstruction')) {
		const mediums = await dbService.find(schoolMediumModel, {
			_id: { $in: payload.mediumOfInstruction },
			isDeleted: false
		});
		if (mediums.length !== payload.mediumOfInstruction.length) {
			throw createErrorResponse(payload.mediumOfInstruction.length === 1 ? MESSAGES.SCHOOL_MEDIUM_NOT_FOUND : MESSAGES.SCHOOL_MEDIUMS_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
		}
		updateToData.mediumOfInstruction = payload.mediumOfInstruction;
	}

	// Validate educationalLevels
	if (payload.hasOwnProperty('educationalLevels')) {
		const levels = await dbService.find(schoolEducationLevelModel, {
			_id: { $in: payload.educationalLevels },
			isDeleted: false
		});
		if (levels.length !== payload.educationalLevels.length) {
			throw createErrorResponse(payload.educationalLevels.length === 1 ? MESSAGES.SCHOOL_EDUCATION_LEVEL_NOT_FOUND : MESSAGES.SCHOOL_EDUCATION_LEVELS_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
		}
		updateToData.educationalLevels = payload.educationalLevels;
	}

	if (payload.hasOwnProperty('name')) updateToData.name = payload.name;
	if (payload.hasOwnProperty('shortName')) updateToData.shortName = payload.shortName;
	if (payload.hasOwnProperty('logo')) updateToData.logo = payload.logo;
	if (payload.hasOwnProperty('description')) updateToData.description = payload.description;
	if (payload.hasOwnProperty('establishedYear')) updateToData.establishedYear = payload.establishedYear;
	if (payload.hasOwnProperty('email')) updateToData.email = payload.email;
	if (payload.hasOwnProperty('contactNumber')) updateToData.contactNumber = payload.contactNumber;
	if (payload.hasOwnProperty('website')) updateToData.website = payload.website;
	if (payload.hasOwnProperty('address')) updateToData.address = payload.address;
	if (payload.hasOwnProperty('schoolType')) updateToData.schoolType = payload.schoolType;
	if (payload.hasOwnProperty('bannerImages')) updateToData.bannerImages = payload.bannerImages;

	await dbService.updateOne(schoolModel, { _id: payload.schoolId }, { $set: updateToData });

	return createSuccessResponse(MESSAGES.SCHOOL_UPDATED);
}

/**
 * Retrieves a list of schools with pagination and search functionality
 * @param {Object} payload - Request payload containing search and pagination parameters
 * @param {string} payload.schoolId - School ID to filter schools by (optional)
 * @param {string} [payload.searchString] - Search string to filter schools by name, email, or contact number (optional)
 * @param {string} payload.sortKey - Field name to sort by
 * @param {number} payload.sortOrder - Sort order (1 for ascending, -1 for descending)
 * @param {number} payload.skip - Number of records to skip for pagination
 * @param {number} payload.limit - Maximum number of records to return
 * @returns {Object} Success response with schools data and count
 * @returns {Array} returns.data - Array of school objects
 * @returns {number} returns.count - Total count of schools matching criteria
 * @throws {Object} Error response if schools retrieval fails
 */
async function getSchools(payload: any) {
	const matchCriteria: {
		isDeleted: boolean;
		_id?: Types.ObjectId;
		$or?: {
			name?: IRegexSearch;
			email?: IRegexSearch;
			contactNumber?: IRegexSearch;
		}[];
	} = {
		isDeleted: false
	};

	if (payload.schoolId) {
		matchCriteria._id = payload.schoolId;
	}

	if (payload.searchString) {
		matchCriteria.$or = [ { name: Utils.aggregateSearchRegex(payload.searchString) }, { email: Utils.aggregateSearchRegex(payload.searchString) }, { contactNumber: Utils.aggregateSearchRegex(payload.searchString) } ];
	}

	const schools = await dbService.aggregate(schoolModel, [
		{ $match: matchCriteria },
		{ $addFields: { studentsCount: 550, staffCount: 85, monthlyCost: 55000 } },
		{
			$facet: {
				data: [
					{ $sort: { [payload.sortKey]: payload.sortOrder } },
					{ $skip: payload.skip },
					{ $limit: payload.limit },
					{
						$lookup: {
							from: 'schoolBoards',
							localField: 'affiliatedSchoolBoard',
							foreignField: '_id',
							as: 'affiliatedSchoolBoard'
						}
					},
					{
						$unwind: {
							path: '$affiliatedSchoolBoard',
							preserveNullAndEmptyArrays: true
						}
					},
					{
						$lookup: {
							from: 'schoolMediums',
							localField: 'mediumOfInstruction',
							foreignField: '_id',
							as: 'mediumOfInstruction'
						}
					},
					{
						$lookup: {
							from: 'schoolEducationLevels',
							localField: 'educationalLevels',
							foreignField: '_id',
							as: 'educationalLevels'
						}
					},
					{
						$project: {
							_id: 1,
							name: 1,
							shortName: 1,
							logo: 1,
							description: 1,
							establishedYear: 1,
							email: 1,
							contactNumber: 1,
							website: 1,
							address: 1,
							'affiliatedSchoolBoard._id': 1,
							'affiliatedSchoolBoard.name': 1,
							'mediumOfInstruction._id': 1,
							'mediumOfInstruction.name': 1,
							schoolType: 1,
							'educationalLevels._id': 1,
							'educationalLevels.name': 1,
							bannerImages: 1,
							studentsCount: 1,
							staffCount: 1,
							monthlyCost: 1,
							createdAt: 1
						}
					}
				],
				count: [ { $count: 'count' } ]
			}
		},
		{ $addFields: { count: { $ifNull: [ { $first: '$count.count' }, 0 ] } } }
	]);

	return createSuccessResponse(MESSAGES.SCHOOLS_FETCHED, {
		data: schools[0]?.data ?? [],
		count: schools[0]?.count ?? 0
	});
}

/**
 * Soft deletes one or more schools by setting isDeleted flag to true
 * @param {Object} payload - Request payload containing school deletion details
 * @param {Array<string>} payload.schoolIds - Array of school IDs to delete
 * @param {Object} payload.schoolOwner - School owner object containing _id
 * @param {string} payload.schoolOwner._id - ID of the school owner
 * @returns {Object} Success response indicating schools were deleted
 * @throws {Object} Error response if schools not found or deletion fails
 */
async function deleteSchools(payload: any) {
	const existingSchools = await dbService.count(schoolModel, {
		_id: { $in: payload.schoolIds },
		schoolOwnerId: payload.schoolOwner._id,
		isDeleted: false
	});

	if (existingSchools !== payload.schoolIds.length) {
		throw createErrorResponse(payload.schoolIds.length > 1 ? MESSAGES.SCHOOLS_NOT_FOUND : MESSAGES.SCHOOL_NOT_FOUND, Constants.ERROR_TYPES.BAD_REQUEST);
	}

	await dbService.updateMany(
		schoolModel,
		{
			_id: { $in: payload.schoolIds },
			schoolOwnerId: payload.schoolOwner._id
		},
		{ $set: { isDeleted: true } }
	);

	return createSuccessResponse(payload.schoolIds.length > 1 ? MESSAGES.SCHOOLS_DELETED : MESSAGES.SCHOOL_DELETED);
}

export const schoolController = {
	createSchool,
	updateSchool,
	getSchools,
	deleteSchools
};
