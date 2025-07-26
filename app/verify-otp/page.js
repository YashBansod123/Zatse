'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyOTP() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('verify');
  const [message, setMessage] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const urlPhone = searchParams.get('phone');
    if (urlPhone) {
      setPhone(urlPhone);
      setStep('verify');
    } else {
      setStep('send');
    }
  }, [searchParams]);

  const sendOTP = async () => {
    setMessage('');
    if (!phone) {
      setMessage('Please enter a phone number to send OTP.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMessage(errorData.error || 'Failed to send OTP');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setStep('verify');
        setMessage('OTP sent to your phone.');
      } else {
        setMessage(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setMessage('Server error while sending OTP.');
    }
  };

  const verifyOTP = async () => {
    setMessage('');
    if (!phone || !code) {
      setMessage('Please enter both phone number and OTP.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMessage(errorData.message || errorData.error || 'Failed to verify OTP');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setMessage('✅ Phone verified successfully!');
        // Store user data in localStorage
        if (data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }

        // Redirect to profile page after a short delay
        setTimeout(() => {
          // You can add logic here to check if firstName/lastName/email are empty
          // If they are, you might redirect to a 'complete profile' page instead
          // For now, we'll always go to /profile
          router.push('/profile');
        }, 1500);
      } else {
        setMessage(data.message || '❌ Invalid OTP');
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setMessage('Server error while verifying OTP.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-6 dark:text-white">Phone Number Verification</h1>

        {step === 'send' && (
          <>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white p-3 rounded-md w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendOTP}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
            >
              Send OTP
            </button>
          </>
        )}

        {step === 'verify' && (
          <>
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
              Enter the 6-digit code sent to <span className="font-semibold">{phone}</span>
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white p-3 rounded-md w-full mb-4 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500"
              maxLength="6"
            />
            <button
              onClick={verifyOTP}
              className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition"
            >
              Verify OTP
            </button>
            <button
              onClick={() => {
                setStep('send');
                setMessage('');
                setCode('');
              }}
              className="w-full mt-2 text-blue-500 dark:text-blue-400 hover:underline text-sm"
            >
              Resend OTP or Change Number
            </button>
          </>
        )}

        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
