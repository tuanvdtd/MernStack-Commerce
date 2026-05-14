import { useState } from "react";
import { Link, useNavigate } from "react-router";
import googleIcon from "~/imports/google-icon.svg";
import { googleLoginUrl } from '~/apis/authApi';
import { userStore } from '~/stores/userStore';
import { Eye, EyeOff } from 'lucide-react';

export function Register() {
  const navigate = useNavigate();
  const { signUp, error, setError, loading } = userStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setconfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setconfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handleSigninClick = () => {
    navigate("/login");
  };

  const handleGoogleSignIn = () => {
    window.location.href = googleLoginUrl();
  }

  const handleInputChange = (id: string, value: string) => {
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleSignUp = async () => {
    if (!formData.name) {
      setError('Vui lòng nhập họ tên');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Vui lòng nhập đúng định dạng email');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
    };

    await signUp(userData);
  };


  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">
      {/* Header */}
      <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.8)] border-b border-[rgba(216,222,226,0.2)] sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-[#00647e] text-2xl font-normal tracking-[-1.2px]">
                FlashBuy
              </Link>
              <div className="bg-[#d8dee2] w-px h-6" />
              <h1 className="text-[#2b2f32] text-lg">Đăng ký</h1>
            </div>
            <Link to="/login" className="text-[#00647e] text-sm hover:underline">
              Trợ giúp?
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[700px] items-center justify-center bg-gray-100">
      <div className="bg-white w-[400px] p-8 rounded-lg shadow-md">
        {/* Tiêu đề */}
        <h1 className="text-2xl font-bold mb-6 text-center">Tạo tài khoản mới</h1>

        {/* Error */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Name Field */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Họ tên
          </label>
          <input
            type="text"
            id="name"
            placeholder="Nhập họ tên"
            className="w-full border rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="youremail@gmail.com"
            className="w-full border rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mật khẩu
          </label>
          <div className="flex items-center border rounded-md px-4 py-2 mt-1">
            <input
              type={passwordVisible ? 'text' : 'password'}
              id="password"
              placeholder="Nhập mật khẩu"
              className="w-full focus:outline-none"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
            <button className="text-gray-500 hover:text-gray-700 ml-2" onClick={togglePasswordVisibility}>
              {passwordVisible ? <Eye /> : <EyeOff />}
            </button>
          </div>

          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mt-4">
            Xác nhận mật khẩu
          </label>
          <div className="flex items-center border rounded-md px-4 py-2 mt-1">
            <input
              type={confirmPasswordVisible ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              className="w-full focus:outline-none"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
            />
            <button className="text-gray-500 hover:text-gray-700 ml-2" onClick={toggleConfirmPasswordVisibility}>
              {confirmPasswordVisible ? <Eye /> : <EyeOff />}
            </button>
          </div>
        </div>

        {/* Create Account Button */}
        <button
          className="w-full bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 transition mb-4"
          onClick={handleSignUp}
          disabled={loading}
        >
          {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
        </button>

        {/* Continue with Google */}
        <button className="w-full bg-gray-100 flex items-center justify-center py-2 rounded-md font-medium hover:bg-gray-200 transition mb-4"
          onClick={handleGoogleSignIn}>
          <img src={googleIcon} alt="Google Logo" className="w-5 h-5 mr-2" />
          Đăng ký với Google
        </button>

        {/* Footer */}
        <p className="text-sm text-center text-gray-500">
          Đã có tài khoản?{' '}
          <button
            onClick={handleSigninClick}
            className="text-blue-500 hover:underline"
          >
            Đăng nhập
          </button>
        </p>
      </div>
    </div>

      {/* Footer */}
      <div className="py-8">
        <div className="max-w-[1280px] mx-auto px-8 flex flex-wrap items-center justify-center gap-4 text-xs text-[#73777a]">
          <span>© 2024 Velocity Editorial. All rights reserved.</span>
          <div className="w-1 h-1 rounded-full bg-[#aaadb0]" />
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-[#585c5f]">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#585c5f]">
              Terms of Service
            </Link>
            <Link to="/help" className="hover:text-[#585c5f]">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
