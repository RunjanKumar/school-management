import mongoose, { Schema, Types, Document } from 'mongoose';

export interface IClass extends Document {
	name: string;
	schoolId: Types.ObjectId;
	description?: string;
	capacity?: number;
	isDeleted: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const classSchema: Schema<IClass> = new Schema(
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

export const classModel = mongoose.model<IClass>('classes', classSchema);
