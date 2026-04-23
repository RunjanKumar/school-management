import mongoose, { Schema, Types, Document } from 'mongoose';
import { Constants } from '../commons/constants';

export interface IUser extends Document {
	_id: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
	email: string;
	password: string | null;
	provider: string;
	providerId: string | null;
	name: string;
	profilePic: string | null;
	isEmailVerified: boolean;
	isDeleted: boolean;
}

const userSchema: Schema<IUser> = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true
		},
		password: {
			type: String,
			default: null
		},
		provider: {
			type: String,
			enum: Object.values(Constants.AUTH_PROVIDERS),
			default: Constants.AUTH_PROVIDERS.LOCAL
		},
		providerId: {
			type: String,
			default: null
		},
		profilePic: {
			type: String,
			default: null
		},
		isEmailVerified: {
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
		collection: 'users'
	}
);

export default mongoose.model<IUser>('users', userSchema);
