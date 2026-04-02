import { commentModel } from "~/models/comment.model";
import { NotFoundError } from "~/core/error.response";

class CommentService {
  static async createComment({productId, userId, content, parentId = null}) {
    let tempValue
    // Nếu có parentId thì kiểm tra xem bình luận cha có tồn tại không
    if (parentId) {
      const parentComment = await commentModel.findById(parentId).lean()
      if (!parentComment) {
        throw new NotFoundError('Parent comment not found')
      }
      tempValue = parentComment.comment_right

      const updateData = {
        comment_productId: productId,
        comment_userId: userId,
        comment_content: content,
        comment_parentId: parentId,
        comment_left: tempValue,
        comment_right: tempValue + 1
      }
      await commentModel.updateMany(
        { comment_productId: productId, comment_right: { $gte: tempValue } },
        { $inc: { comment_right: 2 } }
      )
      await commentModel.updateMany(
        { comment_productId: productId, comment_left: { $gte: tempValue } },
        { $inc: { comment_left: 2 } }
      )
      return commentModel.create(updateData)
    } else {
      // Nếu không có parentId, thêm bình luận gốc
      // Tìm giá trị right lớn nhất hiện tại
      const maxRightComment = await commentModel.findOne({ comment_productId: productId })
        .sort({ comment_right: -1 })
        .lean()
      tempValue = maxRightComment ? maxRightComment.comment_right + 1 : 1
      const newComment = {
        comment_productId: productId,
        comment_userId: userId,
        comment_content: content,
        comment_left: tempValue,
        comment_right: tempValue + 1,
        comment_parentId: null
      }
      return commentModel.create(newComment)
    }
  }

  static async getCommentsByParentId(productId, limit = 50, offset = 0, parentId = null) {
    if (!parentId){
      return await commentModel.find({ comment_productId: productId, comment_parentId: null })
        .sort({ comment_left: 1 })
        .skip(offset)
        .limit(limit)
        .lean()
    }
    else {
      // Lấy tất cả dòng họ con cháu chút chít chụt chịt của ông tổ :))
      const parentComment = await commentModel.findById(parentId).lean()
      if (!parentComment) {
        throw new NotFoundError('Parent comment not found')
      }
      const { comment_left, comment_right } = parentComment
      // Con cháu chắt chít chịt sẽ có left > parent_left và right < parent_right
      // Không lấy ông tổ parent 
      return await commentModel.find({
        comment_productId: productId,
        comment_left: { $gt: comment_left },
        comment_right: { $lt: comment_right }
      })
        .sort({ comment_left: 1 })
        .skip(offset)
        .limit(limit)
        .lean()
    }
  }
  static async deleteComment ({commentId}) {
    // tìm comment theo commentId
    const comment = await commentModel.findById(commentId).lean()
    if (!comment) {
      throw new NotFoundError('Comment not found')
    }
    const { comment_left, comment_right } = comment
    const width = comment_right - comment_left + 1

    // Xoá comment và tất cả con cháu chắt chít chịt của nó
    const deleted = await commentModel.deleteMany({
      comment_left: { $gte: comment_left },
      comment_right: { $lte: comment_right }
    })
    // Cập nhật lại các giá trị left và right của các comment còn lại
    await commentModel.updateMany(
      { comment_productId: comment.comment_productId, comment_left: { $gt: comment_right } },
      { $inc: { comment_left: -width } }
    )
    await commentModel.updateMany(
      { comment_productId: comment.comment_productId, comment_right: { $gt: comment_right } },
      { $inc: { comment_right: -width } }
    )
    return deleted
  }
}

export default CommentService;