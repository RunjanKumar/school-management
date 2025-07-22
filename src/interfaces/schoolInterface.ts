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
	affiliatedSchoolBoard: Types.ObjectId;
	mediumOfInstruction: Types.ObjectId[];
	schoolType: (typeof Constants.SCHOOL_TYPES)[keyof typeof Constants.SCHOOL_TYPES];
	educationalLevels: Types.ObjectId[];
	bannerImages?: string[];
	schoolOwnerId: Types.ObjectId;
	status: (typeof Constants.SCHOOL_STATUS)[keyof typeof Constants.SCHOOL_STATUS];
	isDeleted: boolean;
}
