
import type { User } from '~/types/user';
import type { LoginData, RegisterData, VerifyOtpData } from '~/types/auth';
import axios from './axiosConfig';

interface loginRes {
  user?: User,
  error?: string
}

export const login = async (credentials: LoginData): Promise<loginRes> => {
  try {
    const response = await axios.post('/user/login', credentials);
    var normalUser: User = response.data;

    return {
      user: normalUser
    };

  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Some thing wrong';
    return { error: errorMessage };
  }
};

export const logOut = async (): Promise<{ success?: boolean; message?: string; error?: string }> => {
  try {
    // const response = await axios.post('/user/logout');
    return { success: true, message: 'Logout successful' };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    return { error: errorMessage };
  }
};

export const register = async (
  userData: RegisterData
): Promise<{ success?: boolean; email?: string; message?: string; error?: string }> => {
  try {
    const response = await axios.post('/user/register', userData);
    const data = response.data;
    return {
      success: true,
      email: data.email,
      message: data.message,
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    return { error: errorMessage };
  }
};

export const verifyOtp = async (
  data: VerifyOtpData
): Promise<{ success?: boolean; message?: string; error?: string }> => {
  try {
    const response = await axios.post('/user/verify-otp', data);
    return { success: true, message: response.data.message };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    return { error: errorMessage };
  }
};

export const resendOtp = async (
  email: string
): Promise<{ success?: boolean; message?: string; error?: string }> => {
  try {
    const response = await axios.post('/user/resend-otp', { email });
    return { success: true, message: response.data.message };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    return { error: errorMessage };
  }
};

export const googleLoginUrl = (): string => {
  return `${axios.defaults.baseURL}/user/google`;
};


