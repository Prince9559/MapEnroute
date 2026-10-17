import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AppTextInput from '../../components/common/AppTextInput';
import AppButton from '../../components/common/AppButton';
import { login } from '../../api/authApi';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { loginSession } = useContext(AuthContext);
  const { showToast } = useToast();

  const validateForm = () => {
    let currentErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      currentErrors.email = 'Email address is required';
      showToast('Email address is required.', 'error');
      setErrors(currentErrors);
      return false;
    } else if (!emailRegex.test(email.trim())) {
      currentErrors.email = 'Please enter a valid email address';
      showToast('Please enter a valid email address.', 'error');
      setErrors(currentErrors);
      return false;
    }

    if (!password) {
      currentErrors.password = 'Password is required';
      showToast('Password is required.', 'error');
      setErrors(currentErrors);
      return false;
    } else if (password.length < 6) {
      currentErrors.password = 'Password must be at least 6 characters';
      showToast('Password must be at least 6 characters.', 'error');
      setErrors(currentErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await login(email.trim().toLowerCase(), password);

      if (response && response.success) {
        showToast('Login successful! Redirecting...', 'success');
        setTimeout(async () => {
          await loginSession(response.data.token, response.data);
        }, 600);
      } else {
        showToast(response?.message || 'Invalid email or password.', 'error');
      }
    } catch (error) {
      const serverMessage =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(serverMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.brandTitle}>MapEnroute</Text>
          <Text style={styles.subTitle}>Sign in to your account</Text>

          <AppTextInput
            label="Email Address"
            placeholder="name@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
            }}
            error={errors.email}
          />

          <AppTextInput
            label="Password"
            placeholder="••••••••"
            secureTextEntry={true}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
            }}
            error={errors.password}
          />

          <AppButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.signInBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 36,
    borderRadius: 24,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 6,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1D4ED8',
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  subTitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 28,
    marginTop: 6,
  },
  signInBtn: {
    marginTop: 18,
    borderRadius: 12,
    height: 50,
    backgroundColor: '#1D4ED8',
  },
  footerRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  linkText: {
    fontSize: 14,
    color: '#1D4ED8',
    fontWeight: '700',
  },
});

export default LoginScreen;