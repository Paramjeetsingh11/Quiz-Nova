import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';

const useAuth = () => {
  const { token, isAuthenticated, isLoading, error, login, register, logout, hydrate, clearError } =
    useAuthStore();
  const { fetchProfile, clearProfile } = useUserStore();

  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result.success) {
      await fetchProfile();
    }
    return result;
  };

  const handleRegister = async (userData) => {
    const result = await register(userData);
    if (result.success) {
      await fetchProfile();
    }
    return result;
  };

  const handleLogout = async () => {
    await logout();
    clearProfile();
  };

  return {
    token,
    isAuthenticated,
    isLoading,
    error,
    hydrate,
    clearError,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
};

export default useAuth;
