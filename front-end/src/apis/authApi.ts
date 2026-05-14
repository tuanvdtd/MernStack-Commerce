
import type { User } from '~/types/user';
import type { LoginData, RegisterData } from '~/types/auth';
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

export const register = async (userData: RegisterData): Promise<{ user?: User; error?: string }> => {
  try {
    const response = await axios.post('/user/register', userData);
    const user = response.data;
    localStorage.setItem('token', response.data.token);
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic || '',
        isAdmin: false,
        token: user.token,
      }
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Some thing wrong';
    return { error: errorMessage };
  }
};

export const googleLoginUrl = (): string => {
  return `${axios.defaults.baseURL}/user/google`;
};


