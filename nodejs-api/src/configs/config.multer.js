import multer from "multer"

const uploadMemmory = multer({ storage: multer.memoryStorage() })

const uploadDisk = multer({
  storage: multer.diskStorage({
    // Lưu file vào thư mục uploads trong src
    destination: function (req, file, cb) {
      cb(null, './src/uploads')
    },
    // Đặt tên file là thời gian hiện tại kèm tên gốc của file
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`)
    }
  })
})

export const multerConfigs = {
  uploadMemmory,
  uploadDisk
}