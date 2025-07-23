import { Document } from 'mongoose';

export interface SchoolMediumInterface extends Document {
	_id: string;
	name: string;
	isDeleted?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}
