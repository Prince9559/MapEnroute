import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateProfile } from '../../api/authApi';
import AppTextInput from '../../components/common/AppTextInput';
import AppButton from '../../components/common/AppButton';
import { colors } from '../../theme/colors';

// Vector pencil icon component (Bina kisi extra package ke clean render)
const PencilEditIcon = () => (
  <View style={pencilStyles.wrapper}>
    <View style={pencilStyles.pencilBody} />
    <View style={pencilStyles.pencilTip} />
  </View>
);

const ProfileScreen = () => {
  const { userData, setUserData, logoutSession } = useContext(AuthContext);
  const { showToast } = useToast();

  const [name, setName] = useState(userData?.name || '');
  const [avatarUri, setAvatarUri] = useState(userData?.avatarUrl || null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userData) {
      if (userData.name) setName(userData.name);
      if (userData.avatarUrl) setAvatarUri(userData.avatarUrl);
    }
  }, [userData]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedAsset(asset);
        setAvatarUri(asset.uri);
        showToast('Photo selected. Click Save Changes to update.', 'info');
      }
    } catch (err) {
      showToast('Unable to access media gallery.', 'error');
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      showToast('Name cannot be blank.', 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await updateProfile(name.trim(), selectedAsset);
      if (response && response.success) {
        await setUserData(response.data);
        setSelectedAsset(null);
        showToast('Profile updated successfully!', 'success');
      } else {
        showToast(response?.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Error updating profile. Please try again.';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    showToast('Logged out successfully.', 'info');
    logoutSession();
  };

  return (
    <View style={styles.container}>
      <View style={styles.photoSection}>
        <TouchableOpacity
          onPress={handlePickImage}
          activeOpacity={0.85}
          style={styles.imageContainer}
        >
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.profileImage}
              key={avatarUri}
            />
          ) : (
            <View style={[styles.profileImage, styles.placeholder]}>
              <Text style={styles.placeholderText}>
                {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}

          {/* Circular Pencil Badge Icon */}
          <View style={styles.pencilBadge}>
            <PencilEditIcon />
          </View>
        </TouchableOpacity>

        <Text style={styles.hintText}>Tap to change photo</Text>
      </View>

      <View style={styles.formSection}>
        <AppTextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Prince Maurya"
        />

        <AppTextInput
          label="Email (Read Only)"
          value={userData?.email || ''}
          editable={false}
          style={{ backgroundColor: '#EEF0F2', color: colors.textSecondary }}
        />

        <AppButton
          title="Save Changes"
          onPress={handleSaveProfile}
          loading={saving}
          style={{ marginTop: 16 }}
        />

        <AppButton
          title="Log Out"
          variant="secondary"
          onPress={handleLogout}
          style={{ marginTop: 8 }}
        />
      </View>
    </View>
  );
};

const pencilStyles = StyleSheet.create({
  wrapper: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  pencilBody: {
    width: 4,
    height: 9,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  pencilTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    marginTop: 1,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F8FAFC',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  photoSection: {
    alignItems: 'center',
    marginVertical: 18,
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 3,
    borderColor: '#1D4ED8',
  },
  placeholder: {
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  pencilBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1D4ED8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  hintText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  formSection: {
    marginTop: 12,
  },
});

export default ProfileScreen;