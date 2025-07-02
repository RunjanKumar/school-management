import { Request } from 'express';
import { AdminInterface } from './adminInterface';
import { SchoolOwnerInterface } from './schoolOwnerInterface';

export interface AuthenticatedRequestInterface extends Request {
	admin?: AdminInterface;
	schoolOwner?: SchoolOwnerInterface;
}
