import { IAdmin, ISchoolOwner, IUser } from '../models';

export interface DbConfig {
	PROTOCOL: string;
	HOST: string;
	PORT: number | string;
	NAME: string;
	USER: string;
	PASSWORD: string;
	DATABASE_URI: string;
}

export interface UserUpdateData {
	name: string;
	dob: Date | string;
	gender: number;
	sessions?: string;
	token?: string;
}

export interface SignedToken {
	sessionKey: string;
	token: string;
}

export interface IAuthenticatedRequest extends Request {
	admin?: IAdmin;
	schoolOwner?: ISchoolOwner;
	user?: IUser;
	headers: Request['headers'] & {
		authorization?: string;
	};
}

export interface IRegexSearch {
	$regex: string;
	$options: string;
}
