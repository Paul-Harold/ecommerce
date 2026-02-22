import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../libs/supabase.js';

// We added 'requireAdmin' so we can reuse this guard later for customer checkout!
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const [authStatus, setAuthStatus] = useState('checking'); // 'checking', 'admin', 'customer', 'unauthenticated'

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Get the current logged-in user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setAuthStatus('unauthenticated');
        return;
      }

      // 2. Look up their official role in our new profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || !profile) {
        console.error("Error fetching profile:", error?.message);
        setAuthStatus('unauthenticated');
        return;
      }

      // 3. Assign their status based on the database
      setAuthStatus(profile.role); // This will be exactly 'admin' or 'customer'
    };

    checkAuth();
  }, []);

  // Show a loading spinner while talking to the database
  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-800 border-t-electric rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in? Go to login page.
  if (authStatus === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  // If this specific page needs an admin, but they are a customer, send to shop.
  if (requireAdmin && authStatus !== 'admin') {
    return <Navigate to="/shop" replace />;
  }

  // If they pass all the checks, open the doors!
  return children;
}