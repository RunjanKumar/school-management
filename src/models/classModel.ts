import mongoose, { Schema } from 'mongoose';
import { ClassInterface } from '../interfaces';

const classSchema: Schema<ClassInterface> = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		schoolId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'schools',
			required: true
		},

		description: {
			type: String,
			trim: true
		},
		capacity: {
			type: Number,
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
		collection: 'classes'
	}
);

// Add compound index for uniqueness
// classSchema.index(
// 	{ name: 1, schoolId: 1 },
// 	{ unique: true, name: 'unique_class_per_school_per_year' }
// );

export const classModel = mongoose.model<ClassInterface>('classes', classSchema);
