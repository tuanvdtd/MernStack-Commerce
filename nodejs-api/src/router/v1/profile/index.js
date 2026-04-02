import express from 'express';
import profileController from '~/controllers/profile.controller'
import { accessControlMiddleware } from '~/middlewares/accessControl.middleware.js';
import asyncHandler from '~/core/errorHandle';

const Router = express.Router();

Router.get('/viewAny', accessControlMiddleware('readAny', 'profile'), asyncHandler(profileController.profiles));

Router.get('/viewOwn', accessControlMiddleware('readOwn', 'profile'), asyncHandler(profileController.profile));

export const profileRouter = Router;