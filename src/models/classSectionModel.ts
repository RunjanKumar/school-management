import mongoose, { Schema, Types, Document } from 'mongoose';

export interface IClassSection extends Document {
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

const classSectionSchema: Schema<IClassSection> = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			uppercase: true
		},
		classId: {
			type: Schema.Types.ObjectId,
			ref: 'classes',
			required: true
		},
		schoolId: {
			type: Schema.Types.ObjectId,
			ref: 'schools',
			required: true
		},
		sectionHeadTeacherId: {
			type: Schema.Types.ObjectId,
			ref: 'teachers'
		},
		capacity: {
			type: Number,
			min: 0,
			required: true
		},
		currentStrength: {
			type: Number,
			default: 0,
			min: 0
		},
		isDeleted: {
			type: Boolean,
			default: false
		}
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'classSections'
	}
);

export const classSectionModel = mongoose.model<IClassSection>('classSections', classSectionSchema);
