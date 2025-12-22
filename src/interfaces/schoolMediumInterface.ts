import { Document } from 'mongoose';

export interface SchoolMediumInterface extends Document {
	name: string;
	isDeleted?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}
