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
			type: mongoose.Schema.Types.ObjectId,
			ref: 'classes',
			required: true
		},
		schoolId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'schools',
			required: true
		},
		sectionHeadTeacherId: {
			type: mongoose.Schema.Types.ObjectId,
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

// Add compound index for uniqueness
// classSectionSchema.index(
// 	{ name: 1, classId: 1 },
// 	{ unique: true, name: 'unique_section_per_class_per_year' }
// );

export const classSectionModel = mongoose.model<ClassSectionInterface>('classSections', classSectionSchema);
