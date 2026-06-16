import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Eye, EyeOff, Info, Mail } from 'lucide-react'

import { OtpInput } from '~/components/OtpInput'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { userStore } from '~/stores/userStore'

const RESEND_COOLDOWN_SEC = 60
const OTP_EXPIRY_MINUTES = 5

export function VerifyOtp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const emailParam = searchParams.get('email') ?? ''

  const { verifyOtp, resendOtp, error, setError, loading } = userStore()

  const [email, setEmail] = useState(emailParam)
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    setError(null)
  }, [setError])

  useEffect(() => {
    if (!emailParam) {
      navigate('/register', { replace: true })
    }
  }, [emailParam, navigate])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleVerify = async () => {
    setSuccessMessage(null)
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    if (otp.length !== 6) {
      setError('Please enter all 6 OTP digits')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Password confirmation does not match')
      return
    }

    const ok = await verifyOtp({
      email: email.trim(),
      code: otp,
      password,
      verifyPassword: confirmPassword,
    })
    if (ok) {
      navigate(`/login?verifiedEmail=${encodeURIComponent(email.trim())}`, { replace: true })
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || !email.trim()) return
    setSuccessMessage(null)
    const ok = await resendOtp(email.trim())
    if (ok) {
      setSuccessMessage('A new OTP code has been sent to your email.')
      setOtp('')
      setResendCooldown(RESEND_COOLDOWN_SEC)
    }
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">
      <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.8)] border-b border-[rgba(216,222,226,0.2)] sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-[#00647e] text-2xl font-normal tracking-[-1.2px]">
                FlashBuy
              </Link>
              <div className="bg-[#d8dee2] w-px h-6" />
              <h1 className="text-[#2b2f32] text-lg">Verify account</h1>
            </div>
            <Link to="/login" className="text-[#00647e] text-sm hover:underline">
              Help?
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-gray-100 py-12">
        <div className="bg-white w-[420px] p-8 rounded-lg shadow-md">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-blue-50 p-3">
              <Mail className="size-8 text-blue-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-center">Enter OTP code</h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            We sent a 6-digit code to your email. The code is valid for{' '}
            <strong>{OTP_EXPIRY_MINUTES} minutes</strong>.
          </p>

          <Alert variant="info" className="mb-4">
            <Info className="size-4" />
            <AlertDescription>
              Check your inbox and spam folder if you have not received the email.
            </AlertDescription>
          </Alert>

          {successMessage && (
            <div className="mb-4 p-2 bg-green-100 text-green-800 rounded-md text-sm">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              readOnly={!!emailParam}
              className="w-full border rounded-md px-4 py-2 mt-1 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              OTP code
            </label>
            <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          </div>

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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 ml-2"
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              >
                {passwordVisible ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <div className="flex items-center border rounded-md px-4 py-2 mt-1">
              <input
                type={confirmPasswordVisible ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="Re-enter password"
                className="w-full focus:outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 ml-2"
                onClick={() => setConfirmPasswordVisible((visible) => !visible)}
                aria-label={confirmPasswordVisible ? 'Hide password' : 'Show password'}
              >
                {confirmPasswordVisible ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button
            type="button"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 transition mb-4 disabled:opacity-60"
            disabled={loading || otp.length !== 6 || password.length < 8 || password !== confirmPassword}
            onClick={handleVerify}
          >
            {loading ? 'Verifying...' : 'Verify account'}
          </button>

          <p className="text-sm text-center text-gray-500 mb-2">
            Did not receive the code?{' '}
            <button
              type="button"
              className="text-blue-500 hover:underline disabled:text-gray-400 disabled:no-underline"
              disabled={loading || resendCooldown > 0}
              onClick={handleResend}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP code'}
            </button>
          </p>

          <p className="text-sm text-center text-gray-500">
            <Link to="/login" className="text-blue-500 hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-[1280px] mx-auto px-8 flex flex-wrap items-center justify-center gap-4 text-xs text-[#73777a]">
          <span>© 2024 Velocity Editorial. All rights reserved.</span>
        </div>
      </div>
    </div>
  )
}
