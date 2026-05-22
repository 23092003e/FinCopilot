/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isFirebase: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, displayName: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  customApiKey: string;
  saveCustomApiKey: (key: string) => void;
  setError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setErrorState] = useState<string | null>(null);
  const [customApiKey, setCustomApiKey] = useState<string>('');

  const setError = (err: string | null) => {
    setErrorState(err);
  };

  // Sync custom API key based on logged-in user
  useEffect(() => {
    if (user) {
      const key = localStorage.getItem(`fincopilot_apikey_${user.uid}`) || '';
      setCustomApiKey(key);
    } else {
      setCustomApiKey('');
    }
  }, [user]);

  const saveCustomApiKey = (key: string) => {
    if (user) {
      localStorage.setItem(`fincopilot_apikey_${user.uid}`, key);
      setCustomApiKey(key);
    }
  };

  // 1. Setup Firebase Listener or Local Auth Status Listener
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Local fallbacks: load active session from localStorage
      const cached = localStorage.getItem('fincopilot_user_session');
      if (cached) {
        setUser(JSON.parse(cached));
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, []);

  // 2. Email Login
  const loginWithEmail = async (email: string, password: string) => {
    setError(null);
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (cred.user) {
          setUser({
            uid: cred.user.uid,
            email: cred.user.email,
            displayName: cred.user.displayName,
            photoURL: cred.user.photoURL,
          });
        }
      } catch (err: any) {
        const msg = err.message || '';
        if (msg.includes('auth/operation-not-allowed') || msg.includes('operation-not-allowed')) {
          setError(
            '⚠️ Yêu cầu thao tác bổ sung:\n' +
            'Tính năng Email/Mật khẩu chưa được bật trên Firebase Console của dự án này.\n\n' +
            '💡 Cách giải quyết cực kỳ dễ dàng:\n' +
            '• Cách 1: Click "Đăng nhập qua Google account" ngay bên dưới (phương thức này đã được thiết lập sẵn).\n' +
            '• Cách 2: Vào trang quản lý Firebase -> Authentication -> tab Sign-in method, sau đó bật "Email/Password".'
          );
        } else {
          setError(err.message || 'Lỗi tài khoản hoặc mật khẩu không chính xác.');
        }
        throw err;
      }
    } else {
      // Local Mock DB
      const localUsers = JSON.parse(localStorage.getItem('fincopilot_local_users') || '[]');
      const targetUser = localUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (!targetUser || targetUser.password !== password) {
        const errorMsg = 'Tài khoản hoặc mật khẩu không đúng!';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      const u: User = {
        uid: targetUser.uid,
        email: targetUser.email,
        displayName: targetUser.displayName,
        photoURL: null,
      };
      localStorage.setItem('fincopilot_user_session', JSON.stringify(u));
      setUser(u);
    }
  };

  // 3. Email Register
  const signUpWithEmail = async (email: string, displayName: string, password: string) => {
    setError(null);
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Save the displayName locally as Firebase Auth takes displayName
        if (cred.user) {
          // You could run updateProfile on Firebase user
          setUser({
            uid: cred.user.uid,
            email: cred.user.email,
            displayName: displayName,
            photoURL: null,
          });
        }
      } catch (err: any) {
        const msg = err.message || '';
        if (msg.includes('auth/operation-not-allowed') || msg.includes('operation-not-allowed')) {
          setError(
            '⚠️ Yêu cầu thao tác bổ sung:\n' +
            'Tính năng Email/Mật khẩu chưa được bật trên Firebase Console của dự án này.\n\n' +
            '💡 Cách giải quyết cực kỳ dễ dàng:\n' +
            '• Cách 1: Click "Đăng nhập qua Google account" ngay bên dưới (phương thức này đã được thiết lập sẵn).\n' +
            '• Cách 2: Vào trang quản lý Firebase -> Authentication -> tab Sign-in method, sau đó bật "Email/Password".'
          );
        } else {
          setError(err.message || 'Đăng ký tài khoản không thành công. Hãy thử mật khẩu dài hơn.');
        }
        throw err;
      }
    } else {
      // Local Mock DB register representation
      const localUsers = JSON.parse(localStorage.getItem('fincopilot_local_users') || '[]');
      const exists = localUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        const errorMsg = 'Email này đã được đăng ký!';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      const newUid = 'local_user_' + Math.random().toString(36).substr(2, 9);
      const newUser = {
        uid: newUid,
        email,
        displayName,
        password,
      };
      
      localUsers.push(newUser);
      localStorage.setItem('fincopilot_local_users', JSON.stringify(localUsers));

      const u: User = {
        uid: newUid,
        email,
        displayName,
        photoURL: null,
      };
      localStorage.setItem('fincopilot_user_session', JSON.stringify(u));
      setUser(u);
    }
  };

  // 4. Google Login
  const loginWithGoogle = async () => {
    setError(null);
    if (isFirebaseConfigured && auth) {
      try {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);
        if (cred.user) {
          setUser({
            uid: cred.user.uid,
            email: cred.user.email,
            displayName: cred.user.displayName,
            photoURL: cred.user.photoURL,
          });
        }
      } catch (err: any) {
        setError(err.message || 'Hủy hoặc thất bại đăng nhập với Google account.');
        throw err;
      }
    } else {
      // Local simulate Google Account login
      const mockGUser: User = {
        uid: 'google_user_123',
        email: 'hoangvanmanh2309@gmail.com', // Pre-fill with standard or custom email for smooth experience
        displayName: 'Mạnh Hoàng',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120',
      };
      localStorage.setItem('fincopilot_user_session', JSON.stringify(mockGUser));
      setUser(mockGUser);
    }
  };

  // 5. Logout
  const logout = async () => {
    setError(null);
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    localStorage.removeItem('fincopilot_user_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isFirebase: isFirebaseConfigured,
      loginWithEmail,
      signUpWithEmail,
      loginWithGoogle,
      logout,
      customApiKey,
      saveCustomApiKey,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
