import mongoose, { Schema, Document } from 'mongoose';

export interface ISchoolMedium extends Document {
	name: string;
	isDeleted?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

const SchoolMediumSchema: Schema<ISchoolMedium> = new Schema(
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

export default mongoose.model<ISchoolMedium>('schoolMediums', SchoolMediumSchema);
