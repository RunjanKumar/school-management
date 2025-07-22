import * as adminRoutes from './v1/adminRoutes';
import * as schoolOwnerRoutes from './v1/schoolOwnerRoutes';
import * as schoolRoutes from './v1/schoolRoutes';
import * as schoolBoardRoutes from './v1/schoolBoardRoutes';
import * as schoolMediumRoutes from './v1/schoolMediumRoutes';
import * as schoolEducationLevelRoutes from './v1/schoolEducationLevelRoutes';

export const routes: any = [ ...adminRoutes.default, ...schoolOwnerRoutes.default, ...schoolRoutes.default, ...schoolBoardRoutes.default, ...schoolMediumRoutes.default, ...schoolEducationLevelRoutes.default ];
