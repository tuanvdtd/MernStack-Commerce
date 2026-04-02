import { StatusCodes } from "http-status-codes"
import findById from "~/services/apikey.service.js";
import { HEADER } from "~/constants/header.js";

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY].toString()
    if (!key) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'API key is missing' })
    }
    // check key in db
    const objKey = await findById(key)
    if (!objKey) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'API key is invalid' })
    }
    req.objKey = objKey
    return next()

  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' })
  }
}

const permission = (permission) => {
  return (req, res, next) => {
    if(!req.objKey.permissions) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Permissions not found' })
    }
    if (!req.objKey.permissions.includes(permission)) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Permission denied' })
    }
    return next()
  }
}

// const asyncHandler = fn => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next)
//   }
// };

const authMiddleware = {
  apiKey,
  permission
}

export default authMiddleware;


