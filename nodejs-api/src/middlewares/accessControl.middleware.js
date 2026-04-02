import { AccessControl } from "accesscontrol"
import { AuthFailureError } from "~/core/error.response";
import { RbacService } from "~/services/rbac.service";

// let grantList = [
//     { role: 'admin', resource: 'profile', action: 'read:any', attributes: '*, !views' },
//     { role: 'shop', resource: 'profile', action: 'read:own', attributes: '*' },
// ];


const rbac = new AccessControl();

export const accessControlMiddleware = (action, resource) => {
    return async (req, res, next) => {
      try {
        // fetch grant từ db, nên dùng redis chứ dùng db bình thường thì sẽ rất chậm
        const grants = await RbacService.roleList({
          userId: 0
        });
        rbac.setGrants(grants);
        const role = req.query.role; // Lấy role từ query param, đúng nhất là lấy từ jwt token
        const permission = rbac.can(role)[action](resource);
        if (!permission.granted) {
          throw new AuthFailureError("You don't have enough permission to access this resource");
        } else {
          next();
        }
      } catch (error) {
          next(error);
      }
    }
}
