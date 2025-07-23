import mongoose, { Schema } from 'mongoose';
import { Constants } from '../commons/constants';
import { SchoolBoardInterface } from '../interfaces';

const SchoolBoardSchema: Schema<SchoolBoardInterface> = new Schema(
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

export default mongoose.model<SchoolBoardInterface>('schoolBoards', SchoolBoardSchema);
