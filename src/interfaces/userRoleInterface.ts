import { Document, Types } from 'mongoose';
import { Constants } from '../commons/constants';

export interface UserRoleSchoolPermissions {
	schoolId: Types.ObjectId;
	permissions: (typeof Constants.USER_ROLE_PERMISSIONS)[keyof typeof Constants.USER_ROLE_PERMISSIONS][];
}

export interface UserRoleInterface extends Document {
	_id: Types.ObjectId;
	name: string;
	schoolPermissions: UserRoleSchoolPermissions[];
	isDeleted?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}
