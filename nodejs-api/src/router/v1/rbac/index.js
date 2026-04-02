import express from 'express';
import { RbacController } from '~/controllers/rbac.controller';
import asyncHandler from '~/core/errorHandle';

const Router = express.Router();

Router.post('/role', asyncHandler(RbacController.newRole));
Router.post('/resource', asyncHandler(RbacController.newResource));
Router.get('/resources', asyncHandler(RbacController.getResourceList));
Router.get('/roles', asyncHandler(RbacController.getRoleList));

export const rbacRouter = Router;