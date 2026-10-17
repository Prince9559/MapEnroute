import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../api/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkLoggedInUser = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const savedUser = await AsyncStorage.getItem('userData');

      if (token) {
        setUserToken(token);
        if (savedUser) {
          setUserData(JSON.parse(savedUser));
        }

        // Fresh data MongoDB/Backend se fetch karke sync karein
        try {
          const profileRes = await getProfile();
          if (profileRes && profileRes.data) {
            setUserData(profileRes.data);
            await AsyncStorage.setItem('userData', JSON.stringify(profileRes.data));
          }
        } catch (fetchErr) {
          console.log('Background profile sync error:', fetchErr);
        }
      }
    } catch (e) {
      console.log('Session restore error:', e);
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setUserToken(null);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const loginSession = async (token, user) => {
    await AsyncStorage.setItem('userToken', token);
    if (user) {
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      setUserData(user);
    }
    setUserToken(token);
  };

  const updateUserData = async (newUserData) => {
    setUserData(newUserData);
    await AsyncStorage.setItem('userData', JSON.stringify(newUserData));
  };

  const logoutSession = async () => {
    await AsyncStorage.multiRemove(['userToken', 'userData']);
    setUserToken(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        userData,
        setUserData: updateUserData,
        isLoading,
        loginSession,
        logoutSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};