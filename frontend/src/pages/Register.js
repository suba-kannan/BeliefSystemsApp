import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { storage } from '../utils/storage';

export default function Register({ onRegisterSuccess, onNavigateToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' | 'teacher' | 'hod' | 'principal'
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { id: 'student', label: 'Student', icon: 'person-outline' },
    { id: 'teacher', label: 'Faculty', icon: 'school-outline' },
    { id: 'hod', label: 'HOD', icon: 'shield-checkmark-outline' },
    { id: 'principal', label: 'Principal', icon: 'ribbon-outline' }
  ];

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please fill in all details.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.register(
        name.trim(),
        email.trim(),
        password,
        role
      );

      // Save token and user details
      await storage.setToken(response.token);
      await storage.setUser({
        _id: response._id,
        name: response.name,
        email: response.email,
        role: response.role,
        marks: response.marks
      });

      onRegisterSuccess();
    } catch (error) {
      Alert.alert('Registration Failed', error.message || 'Unable to register user.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/academy-bg.jpg')} 
      style={styles.background}
    >
      <View style={styles.darkOverlay} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.logoWrapper}>
              <View style={styles.logoCircle}>
                <Ionicons name="sparkles" size={28} color="#4f46e5" />
              </View>
              <Text style={styles.brandTitle}>Create Account</Text>
              <Text style={styles.brandSubtitle}>Academy Portal Registration</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Full Name */}
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Suresh Kumar"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Email Address */}
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={18} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="suresh@school.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password */}
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                    size={18} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
              </View>

              {/* Custom Role Selector */}
              <Text style={styles.label}>Select Roster Role</Text>
              <View style={styles.roleGrid}>
                {roles.map((item) => {
                  const isSelected = role === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.roleCard, 
                        isSelected && styles.roleCardActive
                      ]}
                      onPress={() => setRole(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={item.icon} 
                        size={16} 
                        color={isSelected ? '#4f46e5' : '#64748b'} 
                      />
                      <Text style={[
                        styles.roleText, 
                        isSelected && styles.roleTextActive
                      ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity 
                style={styles.registerButton} 
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>Register Now</Text>
                    <Ionicons name="arrow-forward-outline" size={16} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.loginLink} 
                onPress={onNavigateToLogin}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLinkText}>
                  Already have an account? <Text style={styles.boldText}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
    padding: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  roleCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  roleCardActive: {
    borderColor: '#818cf8',
    backgroundColor: '#e0e7ff',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  roleTextActive: {
    color: '#4f46e5',
    fontWeight: '700',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    height: 46,
    marginTop: 24,
    elevation: 2,
    borderBottomWidth: 3,
    borderColor: '#3730a3',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 16,
    padding: 6,
  },
  loginLinkText: {
    fontSize: 13,
    color: '#475569',
  },
  boldText: {
    color: '#4f46e5',
    fontWeight: '700',
  },
});
