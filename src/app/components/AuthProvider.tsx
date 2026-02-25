import { createContext, useContext, useState, type ReactNode } from "react";

export interface User {
  email: string;
  name: string;
  avatar?: string;
  isDemo: boolean;
  hasSeenOnboarding: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  loginWithGoogle: () => boolean;
  loginDemo: () => void;
  logout: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  loginWithGoogle: () => false,
  loginDemo: () => {},
  logout: () => {},
  completeOnboarding: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    if (email && password.length >= 4) {
      setUser({ email, name: email.split("@")[0], isDemo: false, hasSeenOnboarding: false });
      return true;
    }
    return false;
  };

  const loginWithGoogle = () => {
    setUser({
      email: "coleccionista@gmail.com",
      name: "Coleccionista",
      avatar: "G",
      isDemo: false,
      hasSeenOnboarding: false,
    });
    return true;
  };

  const loginDemo = () => {
    setUser({
      email: "demo@sile.app",
      name: "Modo Demo",
      avatar: "D",
      isDemo: true,
      hasSeenOnboarding: false,
    });
  };

  const logout = () => setUser(null);

  const completeOnboarding = () => {
    setUser((u) => (u ? { ...u, hasSeenOnboarding: true } : null));
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, loginDemo, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
