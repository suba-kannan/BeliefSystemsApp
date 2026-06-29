import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  SafeAreaView, 
  View, 
  ActivityIndicator, 
  Text, 
  StatusBar,
  Platform,
  Alert,
  ScrollView,
  RefreshControl
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { storage } from './src/utils/storage';
import { api } from './src/api';

import Navbar from './src/components/Navbar';
import StudentDashboard from './src/components/StudentDashboard';
import TeacherDashboard from './src/components/TeacherDashboard';
import HodDashboard from './src/components/HodDashboard';
import PrincipalDashboard from './src/components/PrincipalDashboard';

import Login from './src/pages/Login';
import Register from './src/pages/Register';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login' | 'register' | 'dashboard'
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dashboards Data States
  const [students, setStudents] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [stats, setStats] = useState(null);

  // Initialize App and check for existing session
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = await storage.getToken();
      const savedUser = await storage.getUser();
      
      if (token && savedUser) {
        // Test token validity by getting current profile
        const freshProfile = await api.getProfile();
        await storage.setUser(freshProfile);
        setUser(freshProfile);
        setIsAuthenticated(true);
        setCurrentScreen('dashboard');
        loadDashboardData(freshProfile);
      } else {
        await storage.clearAll();
      }
    } catch (e) {
      console.log('Session validation failed or server offline. Using cached user if available.');
      const savedUser = await storage.getUser();
      if (savedUser) {
        setUser(savedUser);
        setIsAuthenticated(true);
        setCurrentScreen('dashboard');
        loadDashboardData(savedUser);
      }
    } finally {
      setIsLoadingSession(false);
    }
  };

  const loadDashboardData = async (currentUser) => {
    const role = (currentUser || user)?.role?.toLowerCase();
    if (!role) return;

    try {
      if (role === 'student') {
        const announcementFeed = await api.getUpdates();
        setUpdates(announcementFeed);
      } else if (role === 'teacher') {
        const studentRoster = await api.getStudents();
        const announcementFeed = await api.getUpdates();
        // Filter updates posted by the current teacher
        setStudents(studentRoster);
        setUpdates(announcementFeed);
      } else if (role === 'hod' || role === 'principal') {
        const systemStats = await api.getStats();
        const announcementFeed = await api.getUpdates();
        setStats(systemStats);
        setUpdates(announcementFeed);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error.message);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Re-fetch profile to sync marks/info
      const freshProfile = await api.getProfile();
      setUser(freshProfile);
      await storage.setUser(freshProfile);
      await loadDashboardData(freshProfile);
    } catch (error) {
      console.log('Refresh error:', error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoginSuccess = async () => {
    const freshUser = await storage.getUser();
    setUser(freshUser);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
    setIsLoadingSession(true);
    await loadDashboardData(freshUser);
    setIsLoadingSession(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out of your session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await storage.clearAll();
            setUser(null);
            setIsAuthenticated(false);
            setStudents([]);
            setUpdates([]);
            setStats(null);
            setCurrentScreen('login');
          }
        }
      ]
    );
  };

  const handleUpdateStudentMarks = async (studentId, marksData) => {
    await api.updateMarks(studentId, marksData);
    // Reload roster
    await loadDashboardData(user);
  };

  const handleCreateAnnouncement = async (title, content) => {
    await api.createUpdate(title, content);
    // Reload notice history
    await loadDashboardData(user);
  };

  // Splash Loading Screen
  if (isLoadingSession) {
    return (
      <View style={styles.splashContainer}>
        <Ionicons name="school-outline" size={60} color="#4f46e5" />
        <Text style={styles.splashTitle}>BeliefSystems</Text>
        <Text style={styles.splashSubtitle}>Academic Portal</Text>
        <ActivityIndicator size="large" color="#4f46e5" style={styles.spinner} />
        <ExpoStatusBar style="dark" />
      </View>
    );
  }

  // Auth Screen Router
  if (!isAuthenticated) {
    if (currentScreen === 'register') {
      return (
        <Register 
          onRegisterSuccess={handleLoginSuccess}
          onNavigateToLogin={() => setCurrentScreen('login')}
        />
      );
    }
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setCurrentScreen('register')}
      />
    );
  }

  // Dashboard Renderer mapping
  const renderDashboard = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case 'student':
        return <StudentDashboard user={user} updates={updates} />;
      case 'teacher':
        return (
          <TeacherDashboard 
            students={students}
            updates={updates.filter(u => u.sentBy === user._id)}
            onUpdateMarks={handleUpdateStudentMarks}
            onCreateUpdate={handleCreateAnnouncement}
          />
        );
      case 'hod':
        return (
          <HodDashboard 
            user={user}
            stats={stats}
            updates={updates}
            onCreateUpdate={handleCreateAnnouncement}
          />
        );
      case 'principal':
        return (
          <PrincipalDashboard 
            user={user}
            stats={stats}
            updates={updates}
            onCreateUpdate={handleCreateAnnouncement}
          />
        );
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Invalid Account Role: {user?.role}</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Navbar user={user} onLogout={handleLogout} />
      
      {/* Scrollable Dashboard Wrapper containing Refresh Controls */}
      <View style={styles.dashboardWrapper}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#4f46e5']}
              tintColor="#4f46e5"
            />
          }
        >
          {renderDashboard()}
        </ScrollView>
      </View>
      
      <ExpoStatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  dashboardWrapper: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 16,
    letterSpacing: -0.5,
  },
  splashSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 4,
  },
  spinner: {
    marginTop: 32,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '700',
  },
});
