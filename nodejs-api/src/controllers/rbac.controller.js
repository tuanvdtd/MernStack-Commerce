import { SuccessResponse } from "~/core/success.response"
import { RbacService } from "~/services/rbac.service"

const newRole = async (req, res, next) => {
  new SuccessResponse({
    message: "Role created successfully",
    metadata: await RbacService.createRole({ ...req.body })
  }).send(res)
}

const newResource = async (req, res, next) => {
  new SuccessResponse({
    message: "Resource created successfully",
    metadata: await RbacService.createResource({ ...req.body })
  }).send(res)
}

const getResourceList = async (req, res, next) => {
  new SuccessResponse({
    message: "Get resource list successfully",
    metadata: await RbacService.resourceList({ ...req.query })
  }).send(res)
}

const getRoleList = async (req, res, next) => {
  new SuccessResponse({
    message: "Get role list successfully",
    metadata: await RbacService.roleList({ ...req.query })
  }).send(res)
}

export const RbacController = {
  newRole,
  newResource,
  getResourceList,
  getRoleList
}