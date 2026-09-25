import { createContext, useContext, useEffect, useState } from 'react';
import { loginUser } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authentication when the app starts
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Invalid stored user data. Clearing auth data.');

          localStorage.removeItem('token');
          localStorage.removeItem('user');

          setUser(null);
        }
      }
    } catch (error) {
      console.error('Failed to restore authentication:', error);

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = async (email, password) => {
    const response = await loginUser({
      email,
      password,
    });

    console.log('LOGIN RESPONSE:', response);

    /*
      Your backend should normally return something similar to:

      {
        token: "...",
        user: {
          id: "...",
          name: "...",
          email: "..."
        }
      }

      This also supports common alternatives such as
      accessToken or nested data.
    */

    const token =
      response?.token ||
      response?.accessToken ||
      response?.data?.token ||
      response?.data?.accessToken;

    const userData =
      response?.user ||
      response?.data?.user;

    if (!token) {
      console.error('Login response does not contain a token:', response);
      throw new Error('Invalid login response from server.');
    }

    // Store token
    localStorage.setItem('token', token);

    // Store user if backend returned it
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } else {
      // Still consider the user authenticated
      // even if backend does not return user information.
      const fallbackUser = {
        email,
      };

      localStorage.setItem('user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
    }

    return response;
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