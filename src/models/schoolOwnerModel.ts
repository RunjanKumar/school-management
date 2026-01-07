import mongoose, { Schema, Types, Document } from 'mongoose';

export interface ISchoolOwner extends Document {
	_id: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
	name: string;
	email: string;
	contactNumber: string;
	alternateContactNumber?: string;
	password: string;
	hasSetPassword: boolean;
	isEnabled: boolean;
	isDeleted: boolean;
}

const schoolOwnerSchema: Schema<ISchoolOwner> = new Schema(
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
		isEnabled: {
			type: Boolean,
			default: true
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

export default mongoose.model<ISchoolOwner>('schoolOwners', schoolOwnerSchema);
