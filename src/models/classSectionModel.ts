import mongoose, { Schema } from 'mongoose';
import { ClassSectionInterface } from '../interfaces';

const classSectionSchema: Schema<ClassSectionInterface> = new Schema(
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

export const classSectionModel = mongoose.model<ClassSectionInterface>('classSections', classSectionSchema);
