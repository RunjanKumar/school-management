import mongoose, { Schema, Document } from 'mongoose';

export interface IDBVersion extends Document {
	version: number;
}

const DBVersionSchema: Schema<IDBVersion> = new Schema(
	{
		version: { type: Schema.Types.Number }
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'dbVersion'
	}
);

export default mongoose.model<IDBVersion>('dbVersion', DBVersionSchema);
