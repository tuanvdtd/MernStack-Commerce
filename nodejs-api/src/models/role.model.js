import { model, Schema } from "mongoose";

/*
Dùng thư viện accesscontrol để quản lý quyền
https://www.npmjs.com/package/accesscontrol
let grantList = [
    { role: 'admin', resource: 'video', action: 'create:any', attributes: '*, !views' },
    { role: 'admin', resource: 'video', action: 'read:any', attributes: '*' },
    { role: 'admin', resource: 'video', action: 'update:any', attributes: '*, !views' },
    { role: 'admin', resource: 'video', action: 'delete:any', attributes: '*' },
 
    { role: 'user', resource: 'video', action: 'create:own', attributes: '*, !rating, !views' },
    { role: 'user', resource: 'video', action: 'read:any', attributes: '*' },
    { role: 'user', resource: 'video', action: 'update:own', attributes: '*, !rating, !views' },
    { role: 'user', resource: 'video', action: 'delete:own', attributes: '*' }
];
const ac = new AccessControl(grantList);
You can set grants any time...

const ac = new AccessControl();
ac.setGrants(grantsObject);

*/

const roleSchema = new Schema({
  role_name: {
    type: String,
    required: true
  },
  role_description: {
    type: String,
    default: ""
  },
  role_slug: {
    type: String,
    required: true
  },
  role_status: {
    type: String,
    default: "active",
    enum: ["active", "block", "pending"]
  },
  role_grants: [
    {
      resourceId: {
        type: Schema.Types.ObjectId,
        ref: "Resource",
        required: true
      },
      actions: [
        {
          type: String,
          required: true
        }
      ],
      attributes: {
        type: String,
        default: "*"
      }
    }
  ]
}, {
  timestamps: true,
  collection: "Roles"
});

const roleModel = model("Role", roleSchema);

export default roleModel;