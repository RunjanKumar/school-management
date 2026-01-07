import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
	createdAt: Date;
	updatedAt: Date;
	name: string;
	email: string;
	password: string;
	isDeleted: boolean;
}

const adminSchema: Schema<IAdmin> = new Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true },
		password: { type: String, required: true },
		isDeleted: { type: Boolean, default: false }
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'admins'
	}
);

export default mongoose.model<IAdmin>('admins', adminSchema);
