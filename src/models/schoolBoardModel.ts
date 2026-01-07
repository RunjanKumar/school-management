import mongoose, { Schema, Document } from 'mongoose';
import { Constants } from '../commons/constants';

type SchoolBoardType = (typeof Constants.SCHOOL_BOARD_TYPES)[keyof typeof Constants.SCHOOL_BOARD_TYPES];

export interface ISchoolBoard extends Document {
	type: SchoolBoardType;
	name: string;
	isDeleted?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

const SchoolBoardSchema: Schema<ISchoolBoard> = new Schema(
	{
		type: {
			type: Number,
			enum: Object.values(Constants.SCHOOL_BOARD_TYPES),
			required: true
		},
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
		collection: 'schoolBoards'
	}
);

export default mongoose.model<ISchoolBoard>('schoolBoards', SchoolBoardSchema);
