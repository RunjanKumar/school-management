import { Document } from 'mongoose';
import { Constants } from '../commons/constants';

type SchoolBoardType = (typeof Constants.SCHOOL_BOARD_TYPES)[keyof typeof Constants.SCHOOL_BOARD_TYPES];

export interface SchoolBoardInterface extends Document {
	_id: string;
	type: SchoolBoardType;
	name: string;
	isDeleted?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}
