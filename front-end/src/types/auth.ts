export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
}

export interface VerifyOtpData {
  email: string;
  code: string;
  password: string;
  verifyPassword: string;
}
