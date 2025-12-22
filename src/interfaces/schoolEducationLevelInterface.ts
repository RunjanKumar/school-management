import { Document } from 'mongoose';

export interface SchoolEducationLevelInterface extends Document {
	name: string;
	isDeleted?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}
