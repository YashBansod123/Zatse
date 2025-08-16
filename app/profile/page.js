"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import LightRays from '@/components/LightRays';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsCompletion, setNeedsCompletion] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setMessage('');
      
      const userIdFromUrl = searchParams.get('userId');
      let storedUser = localStorage.getItem('currentUser');
      let userToFetch = null;
      
      if (userIdFromUrl && !storedUser) {
        try {
          const res = await fetch(`http://localhost:5000/api/user/me?userId=${userIdFromUrl}`);
          if (!res.ok) {
            throw new Error('Failed to fetch user profile by ID.');
          }
          const data = await res.json();
          if (data.success && data.user) {
            userToFetch = data.user;
          } else {
            throw new Error('User data not found.');
          }
        } catch (err) {
          console.error('Error fetching user from URL ID:', err);
          router.push('/login');
          return;
        }
      } else if (storedUser) {
        userToFetch = JSON.parse(storedUser);
      } else {
        router.push('/login');
        return;
      }
      
      try {
        const res = await fetch(`http://localhost:5000/api/user/me?userId=${userToFetch._id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch user profile.');
        }
        const data = await res.json();
        if (data.success && data.user) {
          const fetchedUser = data.user;
          setUser(fetchedUser);
          localStorage.setItem('currentUser', JSON.stringify(fetchedUser));
          
          if (!fetchedUser.firstName || !fetchedUser.lastName || !fetchedUser.email || !fetchedUser.phone) {
            setNeedsCompletion(true);
            setFirstName(fetchedUser.firstName || '');
            setLastName(fetchedUser.lastName || '');
            setEmail(fetchedUser.email || '');
            setPhoneNumber(fetchedUser.phone || '');
          } else {
            setNeedsCompletion(false);
          }
        } else {
          throw new Error('User data not found.');
        }
      } catch (err) {
        console.error('Error fetching user profile from server:', err);
        setMessage('Failed to load profile. Please try again.');
        localStorage.removeItem('currentUser');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [router, searchParams]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!firstName || !lastName || !email || !phoneNumber) {
      setMessage('Please fill in all required fields.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/user/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id, // Pass userId for server-side lookup
          firstName,
          lastName,
          email,
          phone: phoneNumber,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMessage(`Update failed: ${errorData.error || errorData.message || 'Unknown error'}`);
        return;
      }

      const data = await res.json();
      if (data.success && data.user) {
        setMessage('Profile updated successfully! ✅');
        setUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setNeedsCompletion(false);
      } else {
        setMessage(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage('Server error during profile update.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 rounded-xl shadow-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
        {needsCompletion ? (
          <>
            <h1 className="text-2xl font-bold text-center mb-6">Complete Your Profile</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
              Please provide your full name, email, and phone number to continue.
            </p>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  First Name:
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Last Name:
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Phone Number:
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1 p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {message && (
                <p className={`mt-4 text-center text-sm ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Save Profile
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-center mb-6">Welcome, {user.firstName}!</h1>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">First Name:</label>
                <p className="mt-1 p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
                  {user.firstName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Last Name:</label>
                <p className="mt-1 p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
                  {user.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Email:</label>
                <p className="mt-1 p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
                  {user.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number:</label>
                <p className="mt-1 p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
                  {user.phone}
                </p>
              </div>
            </div>
          </>
        )}

        <Link href="/">
          <button
            className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Go Back to Homepage
          </button>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full mt-8 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </main>
  );
}
