import mongoose, { Schema } from 'mongoose';
import { SchoolEducationLevelInterface } from '../interfaces';

const SchoolEducationLevelSchema: Schema<SchoolEducationLevelInterface> = new Schema(
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
		collection: 'schoolEducationLevels'
	}
);

export default mongoose.model<SchoolEducationLevelInterface>('schoolEducationLevels', SchoolEducationLevelSchema);
