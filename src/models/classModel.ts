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
			type: Schema.Types.ObjectId,
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

export const classModel = mongoose.model<ClassInterface>('classes', classSchema);
