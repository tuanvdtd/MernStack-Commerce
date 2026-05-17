import { create } from "zustand";
import { type User } from "~/types/user";
import {
  login,
  register,
  verifyOtp as verifyOtpApi,
  resendOtp as resendOtpApi,
} from "~/apis/authApi";
import type { LoginData, RegisterData } from "~/types/auth.ts";
import { createJSONStorage, persist } from "zustand/middleware";

type UserState = {
  //State
  user: User | null;
  error: string | null;
  loading: boolean;

  //Actions
  setLoading: (loading: boolean) => void;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
  signUp: (registerData: RegisterData) => Promise<boolean>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  logIn: (LoginData: LoginData) => Promise<User | null>;
  logOut: () => void;
};

export const userStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      error: null,
      loading: false,
      setUser: (user: User) => set({ user }),
      setError: (error: string | null) => set({ error }),
      setLoading: (loading: boolean) => set({ loading }),

      logIn: async (LoginData: LoginData) => {
        set({ loading: true, error: null });

        const result = await login(LoginData);

        if (result.user) {
          set({ user: result.user, loading: false });
          return result.user;
        } else {
          set({ error: result.error, loading: false });
          return null;
        }
      },

      signUp: async (registerData: RegisterData) => {
        set({ loading: true, error: null });

        const result = await register(registerData);

        if (result.success) {
          set({ loading: false });
          return true;
        } else {
          set({ error: result.error ?? 'Đăng ký thất bại', loading: false });
          return false;
        }
      },

      verifyOtp: async (email: string, code: string) => {
        set({ loading: true, error: null });

        const result = await verifyOtpApi(email, code);

        if (result.success) {
          set({ loading: false });
          return true;
        } else {
          set({ error: result.error ?? 'Xác thực thất bại', loading: false });
          return false;
        }
      },

      resendOtp: async (email: string) => {
        set({ loading: true, error: null });

        const result = await resendOtpApi(email);

        if (result.success) {
          set({ loading: false });
          return true;
        } else {
          set({ error: result.error ?? 'Gửi lại OTP thất bại', loading: false });
          return false;
        }
      },

      logOut: () => {
        set({ user: null });
        localStorage.removeItem("token");
      },

    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist những field cần thiết
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);