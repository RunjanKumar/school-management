import * as adminRoutes from './v1/adminRoutes';
import * as schoolOwnerRoutes from './v1/schoolOwnerRoutes';
import * as schoolRoutes from './v1/schoolRoutes';
import * as schoolBoardRoutes from './v1/schoolBoardRoutes';

export const routes: any = [ ...adminRoutes.default, ...schoolOwnerRoutes.default, ...schoolRoutes.default, ...schoolBoardRoutes.default ];
