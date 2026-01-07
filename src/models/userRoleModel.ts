import mongoose, { Schema, Types, Document } from 'mongoose';
import { Constants } from '../commons/constants';

export interface IUserRoleSchoolPermissions {
	schoolId: Types.ObjectId;
	permissions: (typeof Constants.USER_ROLE_PERMISSIONS)[keyof typeof Constants.USER_ROLE_PERMISSIONS][];
}

export interface IUserRole extends Document {
	_id: Types.ObjectId;
	name: string;
	schoolPermissions: IUserRoleSchoolPermissions[];
	isDeleted?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

const UserRoleSchema: Schema<IUserRole> = new Schema(
	{
		name: {
			type: String,
			required: true
		},
		schoolPermissions: [
			{
				_id: false,
				schoolId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'schools',
					required: true
				},
				permissions: [
					{
						type: Number,
						enum: Object.values(Constants.USER_ROLE_PERMISSIONS),
						required: true
					}
				]
			}
		],
		isDeleted: {
			type: Boolean,
			default: false
		}
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'userRoles'
	}
);

export default mongoose.model<IUserRole>('userRoles', UserRoleSchema);
