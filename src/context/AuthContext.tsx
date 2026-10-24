import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserProfile, DEMO_USERS } from '../types/backend';
import { setApiDemoRole } from '../api/client';

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  availableUsers: UserProfile[];
  canSignClinicalReview: boolean;
  canAttestMedications: boolean;
  canAcknowledgeSbar: boolean;
  canAuthorizeTransport: boolean;
  canConfirmReceiving: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('emerald_shield_role');
    return (saved as UserRole) || 'nurse';
  });

  const currentUser = DEMO_USERS.find(u => u.role === currentRole) || DEMO_USERS[0];

  useEffect(() => {
    localStorage.setItem('emerald_shield_role', currentRole);
    setApiDemoRole(currentRole);
  }, [currentRole]);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    setApiDemoRole(role);
  };

  const isAdmin = currentRole === 'admin';
  const canSignClinicalReview = currentRole === 'physician' || currentRole === 'nurse' || isAdmin;
  const canAttestMedications = currentRole === 'pharmacist' || isAdmin;
  const canAcknowledgeSbar = currentRole === 'receiving_nurse' || currentRole === 'nurse' || isAdmin;
  const canAuthorizeTransport = currentRole === 'transport' || currentRole === 'nurse' || isAdmin;
  const canConfirmReceiving = currentRole === 'receiving_nurse' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        switchRole,
        availableUsers: DEMO_USERS,
        canSignClinicalReview,
        canAttestMedications,
        canAcknowledgeSbar,
        canAuthorizeTransport,
        canConfirmReceiving,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
