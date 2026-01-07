import mongoose, { Schema, Types, Document } from 'mongoose';
import { Constants } from '../commons/constants';

export interface ISession extends Document {
	_id: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
	userId: Types.ObjectId;
	refPath: string;
	type: number;
	token: string;
	expirationTime: Date;
}

const sessionSchema: Schema<ISession> = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			required: true
		},
		refPath: {
			type: String,
			enum: Object.values(Constants.SESSIONS_REF_PATH),
			required: true
		},
		type: {
			type: Number,
			enum: Object.values(Constants.SESSION),
			required: true
		},
		token: {
			type: String,
			required: true
		},
		expirationTime: {
			type: Date,
			required: true
		}
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'sessions'
	}
);

export default mongoose.model<ISession>('sessions', sessionSchema);
