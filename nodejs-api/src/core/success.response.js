import { StatusCodes } from 'http-status-codes'
import { ReasonPhrases } from '~/constants/reasonPhrases.js'

class SuccessResponse {
  constructor({ message, statusCode = StatusCodes.OK, reasonStatusCode = ReasonPhrases.OK, metadata = {} }) {
    this.message = !message ? reasonStatusCode : message
    this.statusCode = statusCode
    this.metadata = metadata
  }

  send(res, headers = {}) {
    return res.status(this.statusCode).json(this)
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata = {} }) {
    super({ message, metadata })
  }
}

class Created extends SuccessResponse {
  constructor({ message, statusCode = StatusCodes.CREATED, reasonStatusCode = ReasonPhrases.CREATED, metadata = {} }) {
    super({ message, statusCode, reasonStatusCode, metadata })
  }
}

export {
  OK,
  Created,
  SuccessResponse
}
