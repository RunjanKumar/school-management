import adminModel from './adminModel';
import dbVersionModel from './dbVersionModel';
import sessionModel from './sessionModel';
import schoolOwnerModel from './schoolOwnerModel';
import schoolModel from './schoolModel';
import schoolBoardModel from './schoolBoardModel';
import schoolMediumModel from './schoolMediumModel';
import schoolEducationLevelModel from './schoolEducationLevelModel';
import userRoleModel from './userRoleModel';
import userModel from './userModel';
import { classModel } from './classModel';
import { classSectionModel } from './classSectionModel';

// Export models
export { adminModel, dbVersionModel, sessionModel, schoolOwnerModel, schoolModel, schoolBoardModel, schoolMediumModel, schoolEducationLevelModel, userRoleModel, userModel, classModel, classSectionModel };

// Export interfaces
export type { IAdmin } from './adminModel';
export type { IDBVersion } from './dbVersionModel';
export type { ISession } from './sessionModel';
export type { ISchoolOwner } from './schoolOwnerModel';
export type { ISchool } from './schoolModel';
export type { ISchoolBoard } from './schoolBoardModel';
export type { ISchoolMedium } from './schoolMediumModel';
export type { ISchoolEducationLevel } from './schoolEducationLevelModel';
export type { IUserRole, IUserRoleSchoolPermissions } from './userRoleModel';
export type { IUser } from './userModel';
export type { IClass } from './classModel';
export type { IClassSection } from './classSectionModel';
