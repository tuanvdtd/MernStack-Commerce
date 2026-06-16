export const LIMIT_COMMON_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export const ALLOW_COMMON_FILE_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
] as const

export const singleFileValidator = (file: File | undefined | null): string | null => {
  if (!file?.name || !file.size || !file.type) {
    return 'Please choose an image file.'
  }
  if (file.size > LIMIT_COMMON_FILE_SIZE) {
    return 'Maximum file size is 10MB.'
  }
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.type as (typeof ALLOW_COMMON_FILE_TYPES)[number])) {
    return 'Only JPG, JPEG, and PNG files are allowed.'
  }
  return null
}
