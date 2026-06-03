import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MockUser } from '../types';
import { MOCK_USERS } from '../data/mockData';

interface AuthContextType {
  user: MockUser;
  setRole: (role: MockUser['role']) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<MockUser['role']>('admin');

  const user: MockUser = MOCK_USERS.find(u => u.role === currentRole) || MOCK_USERS[0];

  return (
    <AuthContext.Provider value={{
      user: { ...user, role: currentRole },
      setRole: setCurrentRole,
      isAdmin: currentRole === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within MockAuthProvider');
  return context;
}
