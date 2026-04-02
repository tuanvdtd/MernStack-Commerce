import { uploadImageFromUrl, uploadImageFromLocal, uploadImageFromLocalFiles } from "~/services/upload.service"
import { SuccessResponse } from "~/core/success.response"
import { BadRequestError } from "~/core/error.response"

export class UploadController {
  static async uploadProductImageFromUrl(req, res) {
    const { imageUrl } = req.body
    const uploadResult = await uploadImageFromUrl(imageUrl, 'products')
    new SuccessResponse({
      message: "Image uploaded successfully",
      metadata: uploadResult
    }).send(res)
  }

  static async uploadProductThumb(req, res) {
    const { file } = req
    if (!file) {
      throw new BadRequestError("No file uploaded")}
    const filePath = file.path
    const uploadResult = await uploadImageFromLocal(filePath, 'products')
    new SuccessResponse({
      message: "Image uploaded successfully",
      metadata: uploadResult
    }).send(res)
  }

  static async uploadProductImages(req, res) {
    const { files } = req
    if (!files || files.length === 0) {
      throw new BadRequestError("No files uploaded")}
    const uploadResults = await uploadImageFromLocalFiles(files, 'products')
    new SuccessResponse({
      message: "Images uploaded successfully",
      metadata: uploadResults
    }).send(res)
  }
}
