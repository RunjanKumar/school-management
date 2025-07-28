import { Document, Types } from 'mongoose';

export interface ClassInterface extends Document {
	_id: Types.ObjectId;
	name: string;
	schoolId: Types.ObjectId;
	description?: string;
	capacity?: number;
	isDeleted: boolean;
	createdAt: Date;
	updatedAt: Date;
}
