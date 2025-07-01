import * as adminRoutes from './v1/adminRoutes';
import * as schoolOwnerRoutes from './v1/schoolOwnerRoutes';

export const routes: any = [ ...adminRoutes.default, ...schoolOwnerRoutes.default ];
