import CommentController from "~/controllers/comment.controller"
import asyncHandle from "~/core/errorHandle"
import { authenticationV2 } from "~/auth/authUtils"

import express from "express"
const router = express.Router()
// Sau này có user model thì thêm middleware xác thực người dùng để lấy userId
// router.use(authenticationV2)
// Route để tạo bình luận

router.post('/', asyncHandle(CommentController.createComment))
// Route để lấy bình luận theo parentId
router.get('/', asyncHandle(CommentController.getCommentsByParentId))
// Route để xóa bình luận
router.delete('/:commentId', asyncHandle(CommentController.deleteComment))
export const commentRouter = router 