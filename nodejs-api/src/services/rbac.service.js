import { BadRequestError } from "~/core/error.response"
import resourceModel from "~/models/resource.model"
import roleModel from "~/models/role.model"

const createResource = async ({
  name = 'profile',
  slug = 'p00001',
  description = ''
}) => {
  try {
    // check resource exist
    // if exist -> throw error
    // else create new resource
    const resource = await resourceModel.create({
      src_name: name,
      src_slug: slug,
      src_description: description
     })
    return resource
  } catch (error) {
    throw error
  }
}

const resourceList = async ({
  userId = 0,
  limit = 50,
  offset = 0,
  search = ''
}) => {
  try {
    // check admin role
    // if not admin -> throw error
    const resources = await resourceModel.aggregate([
      {
        $project: {
          _id: 0,
          name: '$src_name',
          slug: '$src_slug',
          description: '$src_description',
          createAt: 1,
          resourceId: '$_id'
        }
      }
    ])
    return resources
  } catch (error) {
    throw error
  }
}

const createRole = async ({
  name = 'shop',
  slug = 's00001',
  description = 'extended role for shop',
  grants = []
}) => {
  try {
    // check admin role
    // if not admin -> throw error
    // create new role with grants
    const role = {
      role_name: name,
      role_slug: slug,
      role_description: description,
      role_grants: grants
    }
    return await roleModel.create(role)
  } catch (error) {
      throw error
  }
}

const roleList = async ({
  userId = 0,
  limit = 50,
  offset = 0,
  search = ''
}) => {
  try {
    // check admin role
    // if not admin -> throw error
    const roles = await roleModel.aggregate([
      {
        $unwind: {
          path: '$role_grants',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'Resources',
          localField: 'role_grants.resourceId',
          foreignField: '_id',
          as: 'resources'
        }
      },
      {
        $unwind: {
          path: '$resources',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          role: '$role_name',
          resource: '$resources.src_name',
          action: '$role_grants.actions',
          attributes: '$role_grants.attributes'
        }
      },
      {
        $unwind: {
          path: '$action',
          preserveNullAndEmptyArrays: true
        
        }
      }
    ])
    return roles
  } catch (error) {
    throw error
  }
}

export const RbacService = {
  createResource,
  resourceList,
  createRole,
  roleList
}