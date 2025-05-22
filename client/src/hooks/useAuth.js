import { useEffect, useState } from 'react';

const isDevelopment = import.meta.env.MODE === 'development';

// Mock user for development
const mockUser = {
  id: '8235a0fd-a232-40f1-a9ed-b420895804a8',
  email: 'austinblakeoliver@gmail.com',
  name: 'Austin Oliver',
  role: 'admin'
};

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In development, immediately set mock user
    if (isDevelopment) {
      setUser(mockUser);
      setIsLoading(false);
      return;
    }

    // Production auth logic will be implemented later
    setUser(null);
    setIsLoading(false);
  }, []);

  const signIn = async ({ email, password }) => {
    if (isDevelopment) {
      setUser(mockUser);
      return { user: mockUser };
    }
    throw new Error('Auth not implemented in production yet');
  };

  const signUp = async ({ email, password, name }) => {
    if (isDevelopment) {
      const newUser = { ...mockUser, email, name };
      setUser(newUser);
      return { user: newUser };
    }
    throw new Error('Auth not implemented in production yet');
  };

  const signOut = async () => {
    setUser(null);
  };

  const resetPassword = async (email) => {
    if (!isDevelopment) {
      throw new Error('Auth not implemented in production yet');
    }
  };

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
} 