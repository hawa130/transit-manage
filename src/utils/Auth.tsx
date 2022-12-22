import Member from '@/models/Member';
import { createContext, ReactNode, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface AuthContextType {
  user?: Member;
  login: (username: string, password: string) => Promise<Member>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const [user, setUser] = useState<Member | undefined>(userStr ? JSON.parse(userStr) : undefined);

  const login = async (username: string, password: string): Promise<Member> => {
    if (!username) {
      throw new Error('请输入工号');
    }
    const memberID = parseInt(username);
    if (isNaN(memberID)) {
      throw new Error('工号必须是数字');
    }
    const user = await Member.get(memberID);
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  };

  const logout = () => {
    setUser(undefined);
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext<AuthContextType>(AuthContext);
}
