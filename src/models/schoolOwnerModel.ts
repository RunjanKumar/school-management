import mongoose, { Schema } from 'mongoose';
import { SchoolOwnerInterface } from '../interfaces';

const schoolOwnerSchema: Schema<SchoolOwnerInterface> = new Schema(
	{
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true
		},
		contactNumber: {
			type: String,
			required: true,
			trim: true
		},
		alternateContactNumber: { type: String },
		password: {
			type: String,
			required: true
		},
		hasSetPassword: {
			type: Boolean,
			default: false
		},
		isDeleted: {
			type: Boolean,
			default: false
		}
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'schoolOwners'
	}
);

export default mongoose.model<SchoolOwnerInterface>('schoolOwners', schoolOwnerSchema);
