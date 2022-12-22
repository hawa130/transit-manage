import { useAuth } from '@/utils/Auth';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

function AuthRequired({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <> {children} </>;
}

export default AuthRequired;
