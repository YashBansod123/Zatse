"use client";

import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css'; // Required for proper styling
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

export default function LoginPage() {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState(''); // State for displaying messages

  const handleContinue = async () => {
    if (!value) {
      setMessage('Please enter a phone number.');
      return;
    }
    setMessage(''); // Clear previous messages

    try {
      // 1. Create or find user (using the correct /auth/login endpoint)
      const loginRes = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: value }),
      });

      if (!loginRes.ok) {
        const errorData = await loginRes.json();
        setMessage(`Login/User creation failed: ${errorData.error || 'Unknown error'}`);
        return;
      }
      console.log("User login/creation successful."); // Log success for user part

      // 2. Send OTP (using the correct /api/send-otp endpoint)
      const otpRes = await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: value }),
      });

      if (!otpRes.ok) {
        const errorData = await otpRes.json();
        setMessage(`Failed to send OTP: ${errorData.error || 'Unknown error'}`);
        return;
      }

      const data = await otpRes.json();
      if (data.success) {
        // 3. Redirect to OTP page
        // Ensure your Next.js app has a page at /verify-otp that uses app/verify-opt.js
        window.location.href = `/verify-otp?phone=${value}`;
      } else {
        setMessage(data.error || "Failed to send OTP ❌");
      }
    } catch (err) {
      console.error("Server error ❌", err);
      setMessage("A server error occurred. Please try again later.");
    }
  };

  return (
    <main className="min-h-screen mt-14 flex items-center justify-center bg-white dark:bg-black px-4">
      <div className="w-full max-w-md p-8 rounded-xl shadow-md bg-white dark:bg-gray-900">
        <h1 className="text-2xl font-semibold text-center mb-6 dark:text-white">
          What's your phone number or email?
        </h1>

        <div className="mb-4">
          <PhoneInput
            country={'in'}
            value={value}
            onChange={setValue}
            inputStyle={{
              width: '100%',
              height: '50px',
              borderRadius: '0.5rem',
              border: '1px solid #ccc',
              paddingLeft: '3.5rem'
            }}
            containerStyle={{ width: '100%' }}
            buttonStyle={{ borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}
            inputClass="dark:bg-gray-800 dark:text-black dark:border-gray-700"
            specialLabel=""
            enableSearch
          />
        </div>

        {message && (
          <p className="text-red-500 text-sm text-center mb-4">{message}</p>
        )}

        <button
          onClick={handleContinue}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-semibold dark:hover:bg-yellow-500 dark:hover:text-black hover:bg-yellow-500 hover:text-black transition mb-4"
        >
          Continue
        </button>

        <div className="flex items-center justify-center mb-4">
          <hr className="flex-grow border-gray-300 dark:border-gray-600" />
          <span className="px-2 text-sm text-gray-500 dark:text-gray-400">or</span>
          <hr className="flex-grow border-gray-300 dark:border-gray-600" />
        </div>

        <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 dark:border-gray-700 dark:bg-gray-800 py-3 rounded-lg font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition mb-3">
          <FcGoogle className="text-xl" /> Continue with Google
        </button>

        <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 dark:border-gray-700 dark:bg-gray-800 py-3 rounded-lg font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaApple className="text-xl" /> Continue with Apple
        </button>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
          By proceeding, you consent to get calls, WhatsApp or SMS/RCS messages, including by automated means, from Zatse and its affiliates to the number provided.
        </p>
      </div>
    </main>
  );
}
