import asyncHandle from "~/core/errorHandle"
import { authenticationV2 } from "~/auth/authUtils"
import { UploadController } from "~/controllers/upload.controller.js"
import { multerConfigs } from "~/configs/config.multer"

import express from "express"
const router = express.Router()
// Sau này có user model thì thêm middleware xác thực người dùng để lấy userId
// router.use(authenticationV2)

router.post('/product', asyncHandle(UploadController.uploadProductImage))
// single(name) thì name là tên trường chứa file trong form-data, cần giống với frontend gửi lên bằng form-data
router.post('/product/thumb', multerConfigs.uploadDisk.single('file'), asyncHandle(UploadController.uploadProductThumb))
// array(name, maxCount) thì name là tên trường chứa file trong form-data, maxCount là số file tối đa được phép upload
router.post('/product/multiple', multerConfigs.uploadDisk.array('files', 5), asyncHandle(UploadController.uploadProductImages))

export const uploadRouter = router 