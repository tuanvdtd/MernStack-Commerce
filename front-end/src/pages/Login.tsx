import { Link, useNavigate, useSearchParams } from "react-router";
import imgGoogleIcon from "~/imports/google-icon.svg";
import { Footer } from "~/components/Footer";
import { useEffect, useState } from 'react';
import { userStore } from "~/stores/userStore";
import { googleLoginUrl } from "~/apis/authApi";
import { Eye, EyeOff, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { getLoginRedirectPath } from "~/config/rbacConfig";


export function Login() {
  const navigate = useNavigate();
  const { logIn, error, setError, loading } = userStore();
  const [searchParams] = useSearchParams()
  const registeredEmail = searchParams.get('registeredEmail')
  const verifiedEmail = searchParams.get('verifiedEmail')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    setError(null)
    if (registeredEmail) {
      setFormData((prev) => ({ ...prev, email: registeredEmail }))
    }
    if (verifiedEmail) {
      setFormData((prev) => ({ ...prev, email: verifiedEmail }))
    }
  }, []);

  const handleInputChange = (id: string, value: string) => {
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSignupClick = () => {
    navigate("/register");
  };

  const handleForgetPasswordClick = () => {
    navigate("/forgetpassword");
  };

  const handleSignIn = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    const userData = {
      email: formData.email,
      password: formData.password,
    };
    const user = await logIn(userData);
    if (user != null) {
      navigate(getLoginRedirectPath(user.role));
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = googleLoginUrl();
  }

  return (
    <div
      className="bg-[#f8fafc] min-h-screen flex flex-col"
      style={{
        backgroundImage:
          "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 1280 887.5\" xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"none\"><rect x=\"0\" y=\"0\" height=\"100%\" width=\"100%\" fill=\"url(%23grad)\" opacity=\"1\"/><defs><radialGradient id=\"grad\" gradientUnits=\"userSpaceOnUse\" cx=\"0\" cy=\"0\" r=\"10\" gradientTransform=\"matrix(90.51 0 0 62.756 640 443.75)\"><stop stop-color=\"rgba(226,232,240,1)\" offset=\"0.014731\"/><stop stop-color=\"rgba(226,232,240,0)\" offset=\"0.014731\"/></radialGradient></defs></svg>'), linear-gradient(90deg, rgb(248, 250, 252) 0%, rgb(248, 250, 252) 100%)",
      }}
    >
      {/* Header */}
      <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.8)] border-b border-[rgba(216,222,226,0.2)] sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-[#00647e] text-2xl font-normal tracking-[-1.2px]">
                FlashBuy
              </Link>
              <div className="bg-[#d8dee2] w-px h-6" />
              <h1 className="text-[#2b2f32] text-lg">Sign in</h1>
            </div>
            <Link to="/login" className="text-[#00647e] text-sm hover:underline">
              Need help?
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[700px] items-center justify-center bg-gray-100">
      <div className="bg-white w-[400px] p-8 rounded-lg shadow-md">
        {/* Title */}
        <h1 className="text-2xl font-bold mb-6 text-center">Sign in to your account</h1>

        {/* Verified Email Alert */}
        {verifiedEmail && (
          <Alert variant="success" className="mb-4">
            <CheckCircle className="size-4" />
            <AlertDescription>
              Email <strong>{verifiedEmail}</strong> has been verified. You can sign in now.
            </AlertDescription>
          </Alert>
        )}

        {registeredEmail && (
          <Alert variant="info" className="mb-4">
            <Info className="size-4" />
            <AlertDescription>
              Please verify email <strong>{registeredEmail}</strong>.{' '}
              <Link
                to={`/verify-otp?email=${encodeURIComponent(registeredEmail)}`}
                className="font-medium underline"
              >
                Enter OTP
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            <p>{error}</p>
            {error.toLowerCase().includes('not activated') && formData.email && (
              <p className="mt-2">
                <Link
                  to={`/verify-otp?email=${encodeURIComponent(formData.email)}`}
                  className="font-medium underline"
                >
                  Verify account with OTP
                </Link>
              </p>
            )}
          </div>
        )}

        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="a@gmail.com"
            className="w-full border rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="flex items-center border rounded-md px-4 py-2 mt-1">
            <input
              type={passwordVisible ? 'text' : 'password'}
              id="password"
              placeholder="Enter password"
              className="w-full focus:outline-none"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
            <button
              className="text-gray-500 hover:text-gray-700 ml-2"
              onClick={togglePasswordVisibility}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
            >
              {passwordVisible ? <EyeOff /> : <Eye />}
            </button>
          </div>
          <button className="text-sm text-blue-500 hover:underline mt-1 block text-right"
            onClick={handleForgetPasswordClick}>
            Forgot password?
          </button>
        </div>

        {/* Create Account Button */}
        <button
          className="w-full bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 transition mb-4"
          disabled={loading}
          onClick={handleSignIn}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        {/* Continue with Google */}
        <button className="w-full bg-gray-100 flex items-center justify-center py-2 rounded-md font-medium hover:bg-gray-200 transition mb-4"
          onClick={handleGoogleSignIn}>
          <img src={imgGoogleIcon} alt="Google Logo" className="w-5 h-5 mr-2" />
          Sign in with Google
        </button>

        {/* Footer */}
        <p className="text-sm text-center text-gray-500">
          Do not have an account?{' '}
          <button
            onClick={handleSignupClick}
            className="text-blue-500 hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
