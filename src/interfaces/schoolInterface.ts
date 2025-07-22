import { Document, Types } from 'mongoose';
// Correctly import the 'Constants' object which holds your enums
import { Constants } from '../../src/commons/constants';

export interface SchoolInterface extends Document {
	_id: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
	name: string;
	shortName?: string;
	logo?: string;
	description?: string;
	establishedYear?: number;
	email: string;
	contactNumber: string;
	website?: string;
	address: {
		addressLine1: string;
		addressLine2?: string;
		landmark?: string;
		city: string;
		state: string;
		zipcode: string;
		country: string;
		coordinates?: {
			type: 'Point';
			coordinates: [number, number];
		};
	};
	affiliation: (typeof Constants.SCHOOL_AFFILIATION_TYPES)[keyof typeof Constants.SCHOOL_AFFILIATION_TYPES];
	board?: string;
	mediumOfInstruction?: string[];
	schoolType: (typeof Constants.SCHOOL_TYPES)[keyof typeof Constants.SCHOOL_TYPES];
	educationalLevels: Array<(typeof Constants.EDUCATIONAL_LEVELS)[keyof typeof Constants.EDUCATIONAL_LEVELS]>;
	bannerImages?: string[];
	schoolOwnerId: Types.ObjectId;
	status: (typeof Constants.SCHOOL_STATUSES)[keyof typeof Constants.SCHOOL_STATUSES];
	isDeleted: boolean;
}
