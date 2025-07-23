import mongoose, { Schema } from 'mongoose';
import { UserRoleInterface } from '../interfaces';
import { Constants } from '../commons/constants';

const UserRoleSchema: Schema<UserRoleInterface> = new Schema(
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

export default mongoose.model<UserRoleInterface>('userRoles', UserRoleSchema);
