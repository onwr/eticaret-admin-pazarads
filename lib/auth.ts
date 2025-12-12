
import { User, UserRole, AuthResponse } from '../types';
import { mockUsers } from '../utils/mockData';

const TOKEN_KEY = 'nexus_auth_token';
const USER_KEY = 'nexus_user_data';

// Simulate JWT generation/decoding (Base64 for mock purposes)
export const setSession = (auth: AuthResponse) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  }
};

export const updateSessionUser = (user: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Trigger storage event manually for same-tab updates
    window.dispatchEvent(new Event("storage"));
  }
};

export const getSessionToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const getCurrentUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

export const clearSession = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

// Mock API Call: Login
export const login = async (identifier: string, password: string): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if input matches email OR name (treating name as username for mock)
      const user = mockUsers.find((u) => u.email === identifier || u.name === identifier);
      
      if (user) {
        // Generate a fake JWT token
        const token = btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }));
        const response = { user, token };
        setSession(response);
        resolve(response);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 800);
  });
};

// Mock API Call: Register
export const register = async (name: string, email: string, password: string, role: UserRole): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const existingUser = mockUsers.find((u) => u.email === email);
      if (existingUser) {
        reject(new Error('User already exists'));
        return;
      }

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        role,
        password // In real app, hash this
      };
      
      // Update mock data (in memory only for this session)
      mockUsers.push(newUser);

      const token = btoa(JSON.stringify({ id: newUser.id, email: newUser.email, role: newUser.role }));
      const response = { user: newUser, token };
      setSession(response);
      resolve(response);
    }, 800);
  });
};

// Mock API Call: Logout
export const logout = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      clearSession();
      resolve();
    }, 300);
  });
};
