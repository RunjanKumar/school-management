import mongoose, { Schema } from 'mongoose';
import { SchoolInterface } from '../interfaces';
import { Constants } from '../commons/constants';

const schoolSchema: Schema<SchoolInterface> = new Schema(
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

export default mongoose.model<SchoolInterface>('schools', schoolSchema);
