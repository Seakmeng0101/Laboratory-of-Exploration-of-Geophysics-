import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../api/auth.api';
import forgotPasswordImg from '../../assets/forget_password.jpg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    await forgotPassword(email);
    navigate(`/reset-password?email=${encodeURIComponent(email)}`);
  } catch (err: any) {
    setError(err.response?.data?.message || 'Something went wrong');
  } finally {
    setLoading(false);
    
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden">

        {/* Left - Illustration */}
        <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-8">
          <img
            src={forgotPasswordImg}
            alt="Forgot password illustration"
            className="w-full max-w-xs object-contain"
          />
        </div>

        {/* Right - Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-3">
            Forgot <br /> Your Password?
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Please enter your email to reset password
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                Your email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              />
            </div>

            {message && (
              <div className="flex items-center gap-2 bg-green-50 text-green-600 text-sm px-4 py-2.5 rounded-lg">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {message}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-500 text-sm px-4 py-2.5 rounded-lg">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base font-medium text-white bg-blue-400 hover:bg-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed rounded-2xl transition-colors duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Sending...
                </span>
              ) : 'Confirm'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;