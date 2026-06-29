import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StudentDashboard({ user, updates }) {
  const { marks = {} } = user;
  
  const subjects = [
    { name: 'Mathematics', score: marks.Mathematics ?? 0, icon: 'calculator-outline' },
    { name: 'Physics', score: marks.Physics ?? 0, icon: 'flame-outline' },
    { name: 'Chemistry', score: marks.Chemistry ?? 0, icon: 'flask-outline' },
    { name: 'Computer Science', score: marks.ComputerScience ?? 0, icon: 'code-slash-outline' },
  ];

  const calculateGrade = (score) => {
    if (score >= 90) return { name: 'A+', bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
    if (score >= 80) return { name: 'A', bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' };
    if (score >= 70) return { name: 'B', bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' };
    if (score >= 60) return { name: 'C', bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
    if (score >= 50) return { name: 'D', bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
    return { name: 'F', bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
  };

  const calculateAverage = () => {
    const total = subjects.reduce((sum, s) => sum + s.score, 0);
    return Math.round(total / subjects.length);
  };

  const avgScore = calculateAverage();
  const avgGrade = calculateGrade(avgScore);

  const getSenderStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'principal':
        return { border: '#fca5a5', bg: '#fee2e2', text: '#dc2626', label: 'Principal' };
      case 'hod':
        return { border: '#e9d5ff', bg: '#f3e8ff', text: '#7c3aed', label: 'HOD' };
      default:
        return { border: '#bfdbfe', bg: '#dbeafe', text: '#2563eb', label: 'Faculty' };
    }
  };

  const renderNotice = ({ item }) => {
    const style = getSenderStyle(item.senderRole);
    return (
      <View style={[styles.noticeCard, { borderLeftColor: style.text }]}>
        <View style={styles.noticeHeader}>
          <Text style={styles.noticeTitle}>{item.title}</Text>
          <View style={[styles.noticeBadge, { backgroundColor: style.bg }]}>
            <Text style={[styles.noticeBadgeText, { color: style.text }]}>
              {style.label}
            </Text>
          </View>
        </View>
        <Text style={styles.noticeContent}>{item.content}</Text>
        <View style={styles.noticeFooter}>
          <Ionicons name="person-outline" size={12} color="#64748b" />
          <Text style={styles.noticeAuthor}>{item.senderName}</Text>
          <Text style={styles.noticeDot}>•</Text>
          <Text style={styles.noticeTime}>
            {new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome & Overview Card */}
      <View style={styles.welcomeCard}>
        <View>
          <Text style={styles.welcomeTitle}>Welcome back,</Text>
          <Text style={styles.studentName}>{user.name}</Text>
        </View>
        <View style={[styles.avgContainer, { borderColor: avgGrade.border, backgroundColor: avgGrade.bg }]}>
          <Text style={styles.avgLabel}>Overall Average</Text>
          <Text style={[styles.avgValue, { color: avgGrade.text }]}>{avgScore}%</Text>
          <Text style={[styles.avgLetter, { color: avgGrade.text }]}>Grade {avgGrade.name}</Text>
        </View>
      </View>

      {/* Academic Performance */}
      <Text style={styles.sectionTitle}>Academic Performance</Text>
      <View style={styles.grid}>
        {subjects.map((sub, index) => {
          const grade = calculateGrade(sub.score);
          return (
            <View key={index} style={[styles.subjectCard, { borderLeftColor: grade.text }]}>
              <View style={styles.subHeader}>
                <View style={styles.subIconContainer}>
                  <Ionicons name={sub.icon} size={20} color="#4f46e5" />
                  <Text style={styles.subName}>{sub.name}</Text>
                </View>
                <View style={[styles.gradeBadge, { backgroundColor: grade.bg }]}>
                  <Text style={[styles.gradeBadgeText, { color: grade.text }]}>{grade.name}</Text>
                </View>
              </View>
              
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{sub.score}</Text>
                <Text style={styles.maxScoreText}>/100</Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${sub.score}%`, backgroundColor: grade.text }]} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Notice Board */}
      <Text style={styles.sectionTitle}>Announcements & Tasks</Text>
      {updates && updates.length > 0 ? (
        <FlatList
          data={updates}
          renderItem={renderNotice}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="notifications-off-outline" size={40} color="#94a3b8" />
          <Text style={styles.emptyText}>No bulletins posted on your notice board yet.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  studentName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  avgContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  avgLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  avgValue: {
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 1,
  },
  avgLetter: {
    fontSize: 10,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
    marginTop: 8,
  },
  grid: {
    gap: 12,
    marginBottom: 20,
  },
  subjectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderLeftWidth: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gradeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  maxScoreText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    marginLeft: 2,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  listContainer: {
    gap: 12,
  },
  noticeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderLeftWidth: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 12,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  noticeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  noticeBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  noticeContent: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  noticeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  noticeAuthor: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 4,
  },
  noticeDot: {
    fontSize: 10,
    color: '#cbd5e1',
    marginHorizontal: 6,
  },
  noticeTime: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '500',
  },
});
