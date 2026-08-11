export const useAuth = () => {
  const token = sessionStorage.getItem('accessToken');
  const role = sessionStorage.getItem('role') || 'visitor';
  const isLoggedIn = !!token;
  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator';
  const canEdit = isAdmin || isModerator;

  return { token, role, isLoggedIn, isAdmin, isModerator, canEdit };
};