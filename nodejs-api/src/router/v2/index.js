import { StatusCodes } from 'http-status-codes'
import express from 'express'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: `${StatusCodes.OK}`,
    message: 'Server is running in version 2'
  })
})

export const Router_V2 = Router
