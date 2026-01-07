import mongoose, { Schema, Document } from 'mongoose';

export interface ISchoolEducationLevel extends Document {
	name: string;
	isDeleted?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

const SchoolEducationLevelSchema: Schema<ISchoolEducationLevel> = new Schema(
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

export default mongoose.model<ISchoolEducationLevel>('schoolEducationLevels', SchoolEducationLevelSchema);
