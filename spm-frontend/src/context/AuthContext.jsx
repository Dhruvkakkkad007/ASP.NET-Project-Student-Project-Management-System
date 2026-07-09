import React, { createContext, useState, useEffect, useContext } from 'react';
import { DatabaseContext } from './DatabaseContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { users, roles } = useContext(DatabaseContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for saved session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('SPM_Session');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Find active user with matching email
    const user = users.find(
      u => u.Email.toLowerCase() === email.toLowerCase() && u.IsActive && !u.IsDeleted
    );

    if (!user) {
      throw new Error('User not found or account is inactive.');
    }

    if (user.Password !== password) {
      throw new Error('Invalid email or password.');
    }

    // Get role name
    const roleObj = roles.find(r => r.RoleId === user.RoleId);
    const roleName = roleObj ? roleObj.RoleName : 'Student';

    const sessionData = {
      ...user,
      RoleName: roleName
    };

    setCurrentUser(sessionData);
    localStorage.setItem('SPM_Session', JSON.stringify(sessionData));
    return sessionData;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('SPM_Session');
  };

  const updateProfile = (updatedFields) => {
    if (!currentUser) return;
    
    const updatedUser = {
      ...currentUser,
      ...updatedFields
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem('SPM_Session', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      login,
      logout,
      updateProfile,
      isAuthenticated: !!currentUser,
      isAdmin: currentUser?.RoleName === 'Admin',
      isFaculty: currentUser?.RoleName === 'Faculty',
      isStudent: currentUser?.RoleName === 'Student'
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
