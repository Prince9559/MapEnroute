import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors } from '../../theme/colors';

const EyeOpenIcon = ({ color }) => (
  <View style={iconStyles.eyeWrapper}>
    <View style={[iconStyles.eyeOutline, { borderColor: color }]}>
      <View style={[iconStyles.eyePupil, { backgroundColor: color }]} />
    </View>
  </View>
);

const EyeClosedIcon = ({ color }) => (
  <View style={iconStyles.eyeWrapper}>
    <View style={[iconStyles.eyeOutline, { borderColor: color }]}>
      <View style={[iconStyles.eyePupil, { backgroundColor: color }]} />
    </View>
    <View style={[iconStyles.slashLine, { backgroundColor: color }]} />
  </View>
);

const AppTextInput = ({ label, error, secureTextEntry, style, ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPasswordField = Boolean(secureTextEntry);
  const shouldHideText = isPasswordField && !isPasswordVisible;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            Platform.OS === 'web' && { outline: 'none' }, // Browser black border completely removed
            style,
          ]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={shouldHideText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPasswordField && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            activeOpacity={0.6}
          >
            {isPasswordVisible ? (
              <EyeOpenIcon color={colors.primary} />
            ) : (
              <EyeClosedIcon color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const iconStyles = StyleSheet.create({
  eyeWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeOutline: {
    width: 20,
    height: 12,
    borderWidth: 1.6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyePupil: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  slashLine: {
    position: 'absolute',
    width: 20,
    height: 1.6,
    transform: [{ rotate: '-45deg' }],
  },
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  label: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    transition: 'all 0.2s ease',
  },
  inputFocused: {
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
    shadowColor: '#2563EB',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#111827',
  },
  eyeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});

export default AppTextInput;