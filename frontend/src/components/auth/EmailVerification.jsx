import React, { useState, useRef, useEffect } from 'react';
import { IoCheckmarkCircle, IoMail, IoRefresh } from 'react-icons/io5';
import { api } from '../../config/api';

const EmailVerification = ({ email, onVerified, isVerified }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const sendCode = async () => {
    setSending(true);
    setError('');
    
    try {
      await api.post('/email/send-code', { email });
      setTimer(300); // 5 minutes
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send code');
    } finally {
      setSending(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (codeString = code.join('')) => {
    setLoading(true);
    setError('');

    try {
      await api.post('/email/verify-code', { 
        email, 
        code: codeString 
      });
      onVerified();
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="flex items-center text-green-600 text-sm">
        <IoCheckmarkCircle className="mr-2" size={16} />
        <span>Email verified</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Verify your email</span>
        <button
          type="button"
          onClick={sendCode}
          disabled={sending || timer > 0}
          className="flex items-center text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          {sending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
          ) : (
            <IoMail className="mr-1" size={14} />
          )}
          {timer > 0 ? `Resend in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Send Code'}
        </button>
      </div>

      <div className="flex space-x-2 justify-center">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        ))}
      </div>

      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}

      {loading && (
        <div className="flex items-center justify-center text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
          Verifying...
        </div>
      )}
    </div>
  );
};

export default EmailVerification;