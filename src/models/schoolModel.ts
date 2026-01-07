import mongoose, { Schema, Types, Document } from 'mongoose';
import { Constants } from '../commons/constants';

export interface ISchool extends Document {
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

const schoolSchema: Schema<ISchool> = new Schema(
	{
		// Basic Information
		name: {
			type: String,
			required: true,
			trim: true
		},
		shortName: {
			type: String,
			trim: true
		},
		logo: {
			type: String, // URL to the school's logo
			trim: true
		},
		description: {
			type: String,
			trim: true
		},
		establishedYear: {
			type: Number,
			min: 1800
		},

		// Contact Information
		email: {
			type: String,
			required: true,
			lowercase: true,
			trim: true
		},
		contactNumber: {
			type: String,
			required: true,
			trim: true
		},
		website: {
			type: String,
			trim: true
		},

		// Address Information
		address: {
			addressLine1: {
				// Renamed 'address' to 'addressLine1' for clarity
				type: String,
				required: true,
				trim: true
			},
			addressLine2: {
				// Added optional second address line
				type: String,
				trim: true
			},
			landmark: {
				type: String,
				trim: true
			},
			city: {
				type: String,
				required: true,
				trim: true
			},
			state: {
				type: String,
				required: true,
				trim: true
			},
			zipcode: {
				type: String,
				required: true,
				trim: true
			},
			country: {
				type: String,
				required: true,
				trim: true
			},
			coordinates: {
				type: {
					type: String,
					enum: [ 'Point' ],
					default: 'Point'
				},
				coordinates: {
					type: [ Number ], // [longitude, latitude]
					index: '2dsphere' // GeoJSON index for geospatial queries
				}
			}
		},

		// School Specifics
		affiliatedSchoolBoard: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'schoolBoards',
			required: true
		},
		mediumOfInstruction: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'schoolMediums',
				required: true
			}
		],
		schoolType: {
			type: Number,
			enum: [ ...Object.values(Constants.SCHOOL_TYPES) ],
			default: Constants.SCHOOL_TYPES.OTHER
		},
		educationalLevels: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'schoolEducationLevels',
				required: true
			}
		],
		bannerImages: [
			{
				type: String, // URLs to banner images
				trim: true
			}
		],

		// Administrative
		schoolOwnerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'schoolOwners',
			required: true
		},
		status: {
			type: Number,
			enum: [ ...Object.values(Constants.SCHOOL_STATUS) ],
			default: Constants.SCHOOL_STATUS.ACTIVE
		},
		isDeleted: {
			type: Boolean,
			default: false
		}
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'schools'
	}
);

export default mongoose.model<ISchool>('schools', schoolSchema);
