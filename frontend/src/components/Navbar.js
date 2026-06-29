import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Navbar({ user, onLogout }) {
  if (!user) return null;

  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'principal':
        return { bg: '#fee2e2', text: '#dc2626', label: 'Principal' };
      case 'hod':
        return { bg: '#f3e8ff', text: '#7c3aed', label: 'HOD' };
      case 'teacher':
        return { bg: '#dbeafe', text: '#2563eb', label: 'Faculty' };
      default:
        return { bg: '#ecfdf5', text: '#059669', label: 'Student' };
    }
  };

  const badge = getRoleBadgeStyle(user.role);

  return (
    <View style={styles.header}>
      <View style={styles.brandingContainer}>
        <Ionicons name="school-outline" size={24} color="#4f46e5" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>BeliefSystems</Text>
          <Text style={styles.subtitle}>Academy Portal</Text>
        </View>
      </View>

      <View style={styles.userContainer}>
        <View style={styles.profileInfo}>
          <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={22} color="#64748b" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    marginTop: -2,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    maxWidth: '60%',
  },
  profileInfo: {
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderBottomWidth: 2,
    borderColor: '#e2e8f0',
  },
});
