import mongoose, { Schema } from 'mongoose';
import { SchoolMediumInterface } from '../interfaces';

const SchoolMediumSchema: Schema<SchoolMediumInterface> = new Schema(
	{
		name: {
			type: String,
			required: true
		},
		isDeleted: {
			type: Boolean,
			default: false
		}
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'schoolMediums'
	}
);

export default mongoose.model<SchoolMediumInterface>('schoolMediums', SchoolMediumSchema);
