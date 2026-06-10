export const LIMIT_COMMON_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export const ALLOW_COMMON_FILE_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
] as const

export const singleFileValidator = (file: File | undefined | null): string | null => {
  if (!file?.name || !file.size || !file.type) {
    return 'Vui lòng chọn file ảnh.'
  }
  if (file.size > LIMIT_COMMON_FILE_SIZE) {
    return 'Dung lượng tối đa 10MB.'
  }
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.type as (typeof ALLOW_COMMON_FILE_TYPES)[number])) {
    return 'Chỉ chấp nhận JPG, JPEG và PNG.'
  }
  return null
}
