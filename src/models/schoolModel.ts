import mongoose, { Schema } from 'mongoose';
import { SchoolInterface } from '../interfaces';

const schoolSchema: Schema<SchoolInterface> = new Schema(
	{
		name: {
			type: String,
			required: true
		},
		website: { type: String },
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
		address: {
			city: {
				type: String,
				required: true
			},
			state: {
				type: String,
				required: true
			},
			zipcode: {
				type: String,
				required: true
			},
			address: {
				type: String,
				required: true
			},
			landmark: { type: String }
		},
		schoolOwnerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'schoolOwners',
			required: true
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
