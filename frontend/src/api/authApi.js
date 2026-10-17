import client from './client';
import { Platform } from 'react-native';

export const login = async (email, password) => {
  const response = await client.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (name, email, password) => {
  const response = await client.post('/auth/register', { name, email, password });
  return response.data;
};

export const getProfile = async () => {
  const response = await client.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (name, imageAsset) => {
  const formData = new FormData();

  if (name) {
    formData.append('name', name);
  }

  if (imageAsset) {
    if (Platform.OS === 'web') {
      // Browser me blob convert karke actual file append karte hain
      const res = await fetch(imageAsset.uri);
      const blob = await res.blob();
      const filename = imageAsset.fileName || 'profile_' + Date.now() + '.jpg';
      formData.append('avatar', blob, filename);
    } else {
      // Android / iOS ke liye standard format
      formData.append('avatar', {
        uri: imageAsset.uri,
        type: imageAsset.mimeType || 'image/jpeg',
        name: imageAsset.fileName || 'profile.jpg',
      });
    }
  }

  const response = await client.put('/auth/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};