import * as adminRoutes from './v1/adminRoutes';
import * as schoolOwnerRoutes from './v1/schoolOwnerRoutes';
import * as schoolRoutes from './v1/schoolRoutes';
import * as schoolBoardRoutes from './v1/schoolBoardRoutes';
import * as schoolMediumRoutes from './v1/schoolMediumRoutes';
import * as schoolEducationLevelRoutes from './v1/schoolEducationLevelRoutes';
import * as userRoleRoutes from './v1/userRoleRoutes';
import * as classRoutes from './v1/classRoutes';
import * as classSectionRoutes from './v1/classSectionRoutes';
import * as fileUploadRoutes from './v1/fileUploadRoutes';
import * as authRoutes from './v1/authRoutes';

export const routes: any = [ ...adminRoutes.default, ...schoolOwnerRoutes.default, ...schoolRoutes.default, ...schoolBoardRoutes.default, ...schoolMediumRoutes.default, ...schoolEducationLevelRoutes.default, ...userRoleRoutes.default, ...classRoutes.default, ...classSectionRoutes.default, ...fileUploadRoutes.default, ...authRoutes.default ];
