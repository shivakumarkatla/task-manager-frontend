import { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, getCurrentUser } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore logged-in user when the app starts
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setUser(null);
          return;
        }

        const response = await getCurrentUser();

        console.log('CURRENT USER RESPONSE:', response);

        const userData = response?.data;

        if (!userData) {
          throw new Error('Unable to retrieve current user.');
        }

        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch (error) {
        console.error('Failed to restore authentication:', error);

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    const response = await loginUser({
      email,
      password,
    });

    console.log('LOGIN RESPONSE:', response);

    /*
      Expected backend response is something similar to:

      {
        success: true,
        data: {
          token: "...",
          ...
        }
      }

      or:

      {
        success: true,
        token: "..."
      }
    */

    const token =
      response?.token ||
      response?.data?.token;

    if (!token) {
      console.error('Invalid login response:', response);
      throw new Error('Invalid login response from server.');
    }

    // Store JWT first because /auth/me needs it
    localStorage.setItem('token', token);

    // Now retrieve the complete user from MongoDB
    const currentUserResponse = await getCurrentUser();

    console.log(
      'CURRENT USER AFTER LOGIN:',
      currentUserResponse
    );

    const userData = currentUserResponse?.data;

    if (!userData) {
      localStorage.removeItem('token');
      throw new Error('Unable to retrieve user information.');
    }

    // Store complete user information
    localStorage.setItem(
      'user',
      JSON.stringify(userData)
    );

    setUser(userData);

    return userData;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}