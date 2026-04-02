import CommentService from "~/services/comment.service"
import { SuccessResponse } from "~/core/success.response"

class CommentController {
  createComment = async (req, res, next) => {
    const newComment = await CommentService.createComment({ ...req.body })
    new SuccessResponse({
      message: "Comment created successfully",
      metadata: newComment
    }).send(res)
  }
  getCommentsByParentId = async (req, res, next) => {
    const { productId, limit, offset, parentId } = req.query
    const comments = await CommentService.getCommentsByParentId(
      productId,
      limit,
      offset,
      parentId
    )
    new SuccessResponse({
      message: "Comments retrieved successfully",
      metadata: comments
    }).send(res)
  }
  deleteComment = async (req, res, next) => {
    const { commentId } = req.params
    const deleted = await CommentService.deleteComment({ commentId })
    new SuccessResponse({
      message: "Comment deleted successfully",
      metadata: deleted
    }).send(res)
  }
}

export default new CommentController()