import cloudinary from "~/configs/config.cloudinary"
import streamifier from 'streamifier'

export const uploadImageFromUrl = async (imageUrl, folderName = 'uploads') => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, { folder: folderName })
    return {
      url: result.url,
      secureUrl: result.secure_url,
      public_id: result.public_id,
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Hàm upload từ file local, dùng path của file
export const uploadImageFromLocal = async (filePath, folderName = 'uploads') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder: folderName })
    return {
      url: result.url,
      secureUrl: result.secure_url,
      public_id: result.public_id,
      // Tạo URL thumbnail với kích thước 200x200, cắt vừa vặn
      // thumb_url: result.secure_url.replace('/upload/', '/upload/w_200,h_200,c_fill/'),
      thumb_url: cloudinary.url(result.public_id, {
        width: 200,
        height: 200,
        crop: 'fill', // Giữ đúng tỷ lệ và cắt cho vừa khung (thumbnail đều nhau, không méo).
        gravity: "auto", // Tự động lấy phần trung tâm của ảnh
        fetch_format: "auto", // Tự động chọn định dạng ảnh tối ưu
        // format: 'jpg' // Chuyển đổi sang định dạng jpg
      })
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// hàm này upload từ buffer, thay vì dùng hàm upload của cloudinary thì dùng upload_stream
// cần dùng thêm thư viện streamifier để chuyển buffer thành stream, tạo 1 luồng stream để upload, rồi pipe buffer vào đó
export const uploadImageFromLocalBuffer = async (buffer, folderName = 'uploads') => {
  return new Promise((resolve, reject) => {
    // Tạo 1 luồng stream upload lên cloudinary
    const stream = cloudinary.uploader.upload_stream({
       folder: folderName,
      },
      (error, result) => {
        if (result) {
          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            public_id: result.public_id,
            thumb_url: cloudinary.url(result.public_id, {
              width: 200,
              height: 200,
              crop: 'fill', // Giữ đúng tỷ lệ và cắt cho vừa khung (thumbnail đều nhau, không méo).
              gravity: "auto", // Tự động lấy phần trung tâm của ảnh
              fetch_format: "auto", // Tự động chọn định dạng ảnh tối ưu
              // format: 'jpg' // Chuyển đổi sang định dạng jpg
            })
          })
        } else {
          reject(error)
        }
      })
    // Thực hiện upload luồng stream, truyền buffer vào stream, dùng streamifier để tạo readStream từ buffer
    streamifier.createReadStream(buffer).pipe(stream)
  })
}  

export const uploadImageFromLocalFiles = async (files, folderName = 'uploads') => {
  try {
    const uploadResults = []
    for (const file of files) {
      const result = await uploadImageFromLocal(file.path, folderName)
      uploadResults.push(result)
    }
    return uploadResults
  } catch (error) {
    console.error('Error uploading images:', error)
    throw error
  }
}

// tương tự có thể tạo hàm uploadImageFromLocalBuffers nếu cần upload nhiều file từ buffer
