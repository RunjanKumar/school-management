import { Document, Types } from 'mongoose';

export interface ClassSectionInterface extends Document {
	_id: Types.ObjectId;
	name: string; // e.g., "A", "B", "Science", "Commerce"
	classId: Types.ObjectId;
	schoolId: Types.ObjectId;
	sectionHeadTeacherId?: Types.ObjectId;
	capacity: number;
	currentStrength?: number;
	isDeleted: boolean;
	createdAt: Date;
	updatedAt: Date;
}
