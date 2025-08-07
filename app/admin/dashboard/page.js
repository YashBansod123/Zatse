"use client";

import React, { useState, useEffect } from 'react';
import Navbar from "../../../components/Navbar";
import LightRays from "../../../components/LightRays";
import { Check, X, Loader2, FileText, ImageIcon, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ADMIN_SECRET_KEY = 'super-secret-key'; // This should be stored securely in a real app

export default function AdminDashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const router = useRouter();

  const handleUnauthorized = (message) => {
    alert(message);
    router.push('/login'); // Redirect to login page
  };

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/admin/documents', {
        headers: {
          'x-admin-secret': ADMIN_SECRET_KEY, // Send the secret key
        },
      });
      if (res.status === 401) {
        handleUnauthorized("Unauthorized access to admin dashboard.");
        return;
      }
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        const groupedDocs = data.documents.reduce((acc, doc) => {
          const ownerId = doc.owner._id;
          if (!acc[ownerId]) {
            acc[ownerId] = {
              user: doc.owner,
              docs: [],
            };
          }
          acc[ownerId].docs.push(doc);
          return acc;
        }, {});
        setDocuments(Object.values(groupedDocs));
      } else {
        throw new Error(data.error || "Failed to fetch documents.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (docId, action) => {
    setActionLoading(docId);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/documents/${docId}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET_KEY, // Send the secret key
        },
      });
      if (res.status === 401) {
        handleUnauthorized("Unauthorized action on admin dashboard.");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setDocuments(prevDocs => {
          const updatedDocs = prevDocs.map(group => ({
            ...group,
            docs: group.docs.filter(doc => doc._id !== docId)
          }));
          return updatedDocs.filter(group => group.docs.length > 0);
        });
        alert(`Document ${action}d successfully.`);
      } else {
        alert(`Failed to ${action} document: ${data.error}`);
      }
    } catch (err) {
      alert(`Network error during ${action} action.`);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension)) {
      return <ImageIcon className="w-8 h-8 text-blue-500" />;
    } else if (extension === 'pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-white dark:bg-black transition-colors duration-300">
      <Navbar />
      <LightRays
        raysOrigin="top-center"
        raysColor="#00ffff"
        raysSpeed={1.5}
        lightSpread={0.8}
        rayLength={1.2}
        followMouse={true}
        mouseInfluence={0.1}
        distortion={0.05}
        className="custom-rays"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      />
      <div
        className="absolute inset-0 z-10 flex flex-col items-center px-4 py-8 overflow-y-auto"
        style={{ paddingTop: "96px" }}
      >
        <div className="max-w-5xl w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 md:p-8 text-black dark:text-white border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Admin Dashboard</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center">
            Review and verify driver documents.
          </p>

          {loading ? (
            <div className="flex justify-center items-center h-40 text-yellow-500">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-3">Loading documents...</span>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              <p>Error: {error}</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>No new documents pending verification.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {documents.map((group, index) => (
                <div key={index} className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700">
                  <div className="flex items-center mb-4 pb-4 border-b border-gray-300 dark:border-gray-600">
                    <UserIcon className="w-8 h-8 mr-4 text-gray-600 dark:text-gray-300" />
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold">
                        {group.user.firstName || 'User'} {group.user.lastName || ''}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Phone: {group.user.phone} | Email: {group.user.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {group.docs.map((doc) => (
                      <div key={doc._id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-sm">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                          {getFileIcon(doc.fileName)}
                          <div>
                            <p className="text-xl font-semibold">{doc.type}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              File: {doc.fileName}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2 w-full md:w-auto">
                          <a
                            href={`http://localhost:5000/${doc.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-4 rounded-full font-semibold text-sm transition-colors duration-200 bg-blue-500 text-white hover:bg-blue-600 text-center"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleAction(doc._id, 'verify')}
                            disabled={actionLoading === doc._id}
                            className="flex-1 py-2 px-4 rounded-full font-semibold text-sm transition-colors duration-200 bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === doc._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            <span className="ml-2 hidden sm:inline">{actionLoading === doc._id ? 'Verifying...' : 'Verify'}</span>
                          </button>
                          <button
                            onClick={() => handleAction(doc._id, 'reject')}
                            disabled={actionLoading === doc._id}
                            className="flex-1 py-2 px-4 rounded-full font-semibold text-sm transition-colors duration-200 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === doc._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                            <span className="ml-2 hidden sm:inline">{actionLoading === doc._id ? 'Rejecting...' : 'Reject'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
