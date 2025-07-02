import * as adminRoutes from './v1/adminRoutes';
import * as schoolOwnerRoutes from './v1/schoolOwnerRoutes';
import * as schoolRoutes from './v1/schoolRoutes';

export const routes: any = [ ...adminRoutes.default, ...schoolOwnerRoutes.default, ...schoolRoutes.default ];
