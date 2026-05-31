import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOtp, getMe, resendOtp } from '../../api/auth.api';
import emailIcon from '../../assets/email.png';

const VerifyOtp = () => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const email = localStorage.getItem('pendingEmail') || '';

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const visible = local.slice(0, 4);
    return `${visible}*****@${domain}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = pasted.split('').concat(['', '', '', '', '', '']).slice(0, 6);
      setDigits(newDigits);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = async () => {
    const otp = digits.join('');
    if (otp.length < 6) return;
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtp(otp);
      const { accessToken, refreshToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      const meRes = await getMe();
      localStorage.setItem('role', meRes.data.user.role);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResendLoading(true);
    try {
      await resendOtp(email);
      setResent(true);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimeout(() => setResent(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10 text-center">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <img src={emailIcon} alt="Email icon" className="w-16 h-16 object-contain" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Enter Your Verify Code
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          We will send you an one time passcode via{' '}
          <span className="text-gray-700 font-medium">{maskEmail(email)}</span>{' '}
          email address
        </p>

        {/* 6-box OTP Input */}
        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-12 h-12 text-center text-xl font-bold text-gray-800 bg-gray-100 rounded-lg border-2 outline-none transition-all duration-150 ${
                digit ? 'border-blue-500' : 'border-transparent'
              } focus:border-blue-500`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4 text-left">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || digits.join('').length < 6}
          className="w-full py-3 text-base font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed rounded-xl transition-colors duration-200 mb-5"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Verifying...
            </span>
          ) : 'Confirm'}
        </button>

        {/* Resend Row */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Didn't get code</span>
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className={`font-medium transition-colors duration-200 disabled:cursor-not-allowed ${
              resent ? 'text-green-500' : 'text-red-500 hover:text-red-600'
            }`}
          >
            {resendLoading ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Sending...
              </span>
            ) : resent ? 'Sent!' : 'Resend'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default VerifyOtp;