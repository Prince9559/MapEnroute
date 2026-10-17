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
import { register } from '../../api/authApi';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { loginSession } = useContext(AuthContext);
  const { showToast } = useToast();

  const validateForm = () => {
    let currentErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      currentErrors.name = 'Full name is required';
      showToast('Full name is required.', 'error');
      setErrors(currentErrors);
      return false;
    }

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

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await register(name.trim(), email.trim().toLowerCase(), password);

      if (res && res.success) {
        showToast('Account registered successfully! Welcome.', 'success');
        setTimeout(async () => {
          await loginSession(res.data.token, res.data);
        }, 600);
      } else {
        showToast(res?.message || 'Unable to register.', 'error');
      }
    } catch (err) {
      const serverMessage =
        err.response?.data?.message || 'Registration failed. Please try again.';
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
          <Text style={styles.brandTitle}>Register</Text>
          <Text style={styles.subTitle}>Create your MapEnroute account</Text>

          <AppTextInput
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
            }}
            error={errors.name}
          />

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
            title="Register"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitButton}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>Login</Text>
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
    fontSize: 30,
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
  submitButton: {
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

export default RegisterScreen;