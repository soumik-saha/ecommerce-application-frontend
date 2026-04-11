import { useAppSelector } from '../app/hooks';

export function useAuth() {
  const { user, accessToken, role, isAuthenticated, loading, error } = useAppSelector(
    (state) => state.auth
  );

  return {
    user,
    accessToken,
    role,
    isAuthenticated,
    loading,
    error,
    isAdmin: role === 'ADMIN',
  };
}
