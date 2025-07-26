'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsCompletion, setNeedsCompletion] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); // For form messages

  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setMessage(''); // Clear messages on load
      const storedUser = localStorage.getItem('currentUser');

      if (!storedUser) {
        router.push('/login'); // No user in localStorage, redirect to login
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser); // Set initial user from localStorage

      try {
        // Fetch the most up-to-date user data from the server
        const res = await fetch(`http://localhost:5000/api/user/me?phone=${parsedUser.phone}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          // Handle cases where user might not be found on server or other errors
          localStorage.removeItem('currentUser'); // Clear stale data
          router.push('/login');
          return;
        }

        const data = await res.json();
        if (data.success && data.user) {
          const fetchedUser = data.user;
          setUser(fetchedUser); // Update state with fresh data
          localStorage.setItem('currentUser', JSON.stringify(fetchedUser)); // Update localStorage

          // Check if profile needs completion
          if (!fetchedUser.firstName || !fetchedUser.lastName || !fetchedUser.email) {
            setNeedsCompletion(true);
            setFirstName(fetchedUser.firstName || '');
            setLastName(fetchedUser.lastName || '');
            setEmail(fetchedUser.email || '');
          } else {
            setNeedsCompletion(false);
          }
        } else {
          // If server indicates failure, treat as unauthenticated
          localStorage.removeItem('currentUser');
          router.push('/login');
        }
      } catch (err) {
        console.error('Error fetching user profile from server:', err);
        setMessage('Failed to load profile. Please try again.');
        localStorage.removeItem('currentUser'); // Clear potentially bad data
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    if (!firstName || !lastName || !email) {
      setMessage('Please fill in all required fields.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/user/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phone, // Use the phone from the current user state
          firstName,
          lastName,
          email,
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
        setUser(data.user); // Update local state with new user data
        localStorage.setItem('currentUser', JSON.stringify(data.user)); // Update localStorage
        setNeedsCompletion(false); // No longer needs completion
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
    // This case should ideally be handled by the redirect in useEffect
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 rounded-xl shadow-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
        {needsCompletion ? (
          <>
            <h1 className="text-2xl font-bold text-center mb-6">Complete Your Profile</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
              Please provide your full name and email to continue.
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
