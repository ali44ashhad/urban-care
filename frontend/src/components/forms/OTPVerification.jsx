import React, { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

/**
 * OTPVerification Component
 * Props:
 * - phone: string - Phone number to verify
 * - onVerify: (code) => Promise - Callback when OTP is verified
 * - onResend: () => Promise - Callback to resend OTP
 * - loading: boolean - Loading state
 */
export default function OTPVerification({ phone, onVerify, onResend, loading = false }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    try {
      await onVerify(code);
    } catch (err) {
      setError(err.message || 'Invalid OTP code');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    try {
      await onResend();
      setResendCooldown(60); // 60 second cooldown
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    }
  };

  // Mask phone number for display
  const maskedPhone = phone ? phone.replace(/(\d{2})\d+(\d{2})$/, '$1****$2') : '';

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6 space-y-4 max-w-md mx-auto">
      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Verify Your Phone Number</h3>
        <p className="text-sm text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="text-sm font-semibold text-gray-900 mt-1">{maskedPhone}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Verification Code
          </label>
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 text-center">{error}</div>
        )}

        <Button
          type="submit"
          loading={loading}
          variant="primary"
          className="w-full"
        >
          Verify Code
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Didn't receive code? Resend"}
          </button>
        </div>
      </form>
    </div>
  );
}
