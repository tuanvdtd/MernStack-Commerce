import { StatusCodes } from 'http-status-codes'

export class ApiError extends Error {
  statusCode: number
  details?: unknown
  code?: string

  constructor(statusCode: number, message: string, details?: unknown, code?: string) {
    // Message cần truyền vào super() để class Error gốc có thể khởi tạo đúng cách và sử dụng được đầy đủ Error.captureStackTrace
    super(message)
    this.statusCode = statusCode
    this.details = details
    this.code = code
    Object.setPrototypeOf(this, new.target.prototype) // Tránh lỗi prototype chain khi kế thừa từ Error (built-in object của JavaScript)
    Error.captureStackTrace(this, this.constructor) // Làm gọn gàng stack trace, dễ đọc, dễ debug
  }

  /** 400 Bad Request — Dữ liệu đầu vào không hợp lệ */
  static BadRequest(msg = 'Bad Request', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.BAD_REQUEST, msg, details, code)
  }
  // Sau này mở rộng thêm các static theo mã lỗi...
  static Unauthorized(msg = 'Unauthorized', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.UNAUTHORIZED, msg, details, code)
  }

  static Forbidden(msg = 'Forbidden', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.FORBIDDEN, msg, details, code)
  }

  static NotFound(msg = 'Not Found', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.NOT_FOUND, msg, details, code)
  }

  static Conflict(msg = 'Conflict', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.CONFLICT, msg, details, code)
  }

  static UnsupportedMediaType(msg = 'Unsupported Media Type', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.UNSUPPORTED_MEDIA_TYPE, msg, details, code)
  }

  static PayloadTooLarge(msg = 'Payload Too Large', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.REQUEST_TOO_LONG, msg, details, code)
  }

  static Internal(msg = 'Internal Server Error', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, msg, details, code)
  }

  static RedisError(msg = 'Redis Error', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, msg, details, code)
  }
}
