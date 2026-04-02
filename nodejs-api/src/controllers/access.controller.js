import { StatusCodes } from 'http-status-codes'
import AccessService from '~/services/access.service.js';
import { OK, Created, SuccessResponse } from '~/core/success.response.js';
class AccessController {

  static signIn = async (req, res, next) => {
    // console.log('req.body:', req.body);
    const { email } = req.body;
    // if (!email) {
    //   return next(new Error('Email is required'));
    // }
    const result = await AccessService.signIn({ ...req.body })
    new SuccessResponse({
      message: 'Sign in successful',
      metadata: result
    }).send(res)
  }


  static signUp = async (req, res, next) => {
    // console.log('req.body:', req.body);
    const result = await AccessService.signUp(req.body)
    new Created({
      message: 'Shop created successfully',
      metadata: result
    }).send(res)
  }

  static signOut = async (req, res, next) => {
    const result = await AccessService.signOut({ keyStore: req.keyStore })
    new SuccessResponse({
      message: 'Sign out successful',
      metadata: result
    }).send(res)
  }

  static refreshToken = async (req, res, next) => {
    const result = await AccessService.refreshToken({
      keyStore: req.keyStore,
      refreshToken: req.refreshToken,
      user: req.user
    })
    new SuccessResponse({
      message: 'Refresh token successful',
      metadata: result
    }).send(res)
  }

}


export default AccessController;