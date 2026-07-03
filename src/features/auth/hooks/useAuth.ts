import { useState } from "react";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isPremium: boolean;
}

const DEFAULT_USER: UserSession = {
  id: "user-1",
  name: "Nguyễn Minh Quang",
  email: "quangnm@gmail.com",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
  isPremium: true
};

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(DEFAULT_USER);

  const togglePremium = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        isPremium: !currentUser.isPremium
      });
    }
  };

  return {
    currentUser,
    isLoggedIn: !!currentUser,
    togglePremium
  };
}
