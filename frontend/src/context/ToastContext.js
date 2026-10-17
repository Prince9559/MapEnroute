import React, { createContext, useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity,
} from 'react-native';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const timerRef = useRef(null);

  const showToast = (message, type = 'success', duration = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ visible: true, message, type });

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    timerRef.current = setTimeout(() => {
      hideToast();
    }, duration);
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      setToast({ visible: false, message: '', type: 'success' });
    });
  };

  const getBorderColor = () => {
    if (toast.type === 'error') return '#EF4444';
    if (toast.type === 'info') return '#3B82F6';
    return '#10B981';
  };

  const getIcon = () => {
    if (toast.type === 'error') return '✕';
    if (toast.type === 'info') return 'ℹ';
    return '✓';
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast.visible && (
        <Animated.View
          style={[
            styles.toastContainer,
            Platform.OS === 'web' && { position: 'fixed' },
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              borderLeftColor: getBorderColor(),
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: getBorderColor() }]}>
            <Text style={styles.iconText}>{getIcon()}</Text>
          </View>
          <Text style={styles.toastMessage}>{toast.message}</Text>
          <TouchableOpacity onPress={hideToast} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 24 : 54,
    right: 24,
    zIndex: 999999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 5,
    elevation: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    minWidth: 300,
    maxWidth: 420,
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  toastMessage: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 18,
  },
  closeBtn: {
    marginLeft: 12,
    paddingHorizontal: 4,
  },
  closeText: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '600',
  },
});