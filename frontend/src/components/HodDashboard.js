import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function HodDashboard({ user, stats, updates, onCreateUpdate }) {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'directory' | 'broadcast'
  const [userRoleToggle, setUserRoleToggle] = useState('teacher'); // 'teacher' | 'student'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Memo form state
  const [memoTitle, setMemoTitle] = useState('');
  const [memoContent, setMemoContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fallbacks
  const counts = stats?.counts || { students: 0, teachers: 0, hods: 0 };
  const averages = stats?.averages || { Mathematics: 0, Physics: 0, Chemistry: 0, ComputerScience: 0, Overall: 0 };
  const users = stats?.users || { teachers: [], students: [] };

  const subjectList = [
    { name: 'Mathematics', avg: averages.Mathematics, icon: 'calculator-outline', color: '#10b981', bg: '#ecfdf5' },
    { name: 'Physics', avg: averages.Physics, icon: 'flame-outline', color: '#3b82f6', bg: '#eff6ff' },
    { name: 'Chemistry', avg: averages.Chemistry, icon: 'flask-outline', color: '#a855f7', bg: '#faf5ff' },
    { name: 'Computer Science', avg: averages.ComputerScience, icon: 'code-slash-outline', color: '#f59e0b', bg: '#fffbeb' },
  ];

  const calculateGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const handleShareReportCard = async (student) => {
    const m = student.marks?.Mathematics ?? 0;
    const p = student.marks?.Physics ?? 0;
    const c = student.marks?.Chemistry ?? 0;
    const cs = student.marks?.ComputerScience ?? 0;
    const total = m + p + c + cs;
    const average = Math.round(total / 4);

    const reportCardText = `===========================================================
                 BELIEFSYSTEMS ACADEMY
                 OFFICIAL REPORT CARD
===========================================================
STUDENT PROFILE
------------
Name: ${student.name}
Email: ${student.email}
Date: ${new Date().toLocaleDateString()}
-----------------------------------------------------------
ACADEMIC SCORES (Out of 100)
------------
Mathematics: ${m} (Grade ${calculateGrade(m)})
Physics: ${p} (Grade ${calculateGrade(p)})
Chemistry: ${c} (Grade ${calculateGrade(c)})
Computer Science: ${cs} (Grade ${calculateGrade(cs)})
-----------------------------------------------------------
SUMMARY STATISTICS
------------
Total Score: ${total} / 400
Overall Percentage: ${average}%
Overall Grade: ${calculateGrade(average)}
-----------------------------------------------------------
Authorized Signature: HOD Academic Review
===========================================================`;

    try {
      const filename = `${student.name.replace(/\s+/g, '_')}_ReportCard.txt`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      // Write the content to a temporary file
      await FileSystem.writeAsStringAsync(fileUri, reportCardText, {
        encoding: FileSystem.EncodingType.UTF8
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: `Share ${student.name}'s Report Card`,
          UTI: 'public.plain-text'
        });
      } else {
        Alert.alert('Unsupported', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error generating/sharing report card:', error);
      Alert.alert('Error', 'Failed to generate report card file.');
    }
  };

  const handleSendMemo = async () => {
    if (!memoTitle.trim() || !memoContent.trim()) {
      Alert.alert('Required Fields', 'Please fill in both title and content.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreateUpdate(memoTitle, memoContent);
      setMemoTitle('');
      setMemoContent('');
      Alert.alert('Success', 'Memo published successfully.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to post memo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeDirectoryList = userRoleToggle === 'teacher' ? users.teachers : users.students;
  const filteredDirectory = activeDirectoryList.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Tab Selectors */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'stats' && styles.tabItemActive]}
          onPress={() => setActiveTab('stats')}
        >
          <Ionicons name="bar-chart-outline" size={16} color={activeTab === 'stats' ? '#4f46e5' : '#64748b'} />
          <Text style={[styles.tabLabel, activeTab === 'stats' && styles.tabLabelActive]}>Metrics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'directory' && styles.tabItemActive]}
          onPress={() => setActiveTab('directory')}
        >
          <Ionicons name="folder-open-outline" size={16} color={activeTab === 'directory' ? '#4f46e5' : '#64748b'} />
          <Text style={[styles.tabLabel, activeTab === 'directory' && styles.tabLabelActive]}>Roster</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'broadcast' && styles.tabItemActive]}
          onPress={() => setActiveTab('broadcast')}
        >
          <Ionicons name="create-outline" size={16} color={activeTab === 'broadcast' ? '#4f46e5' : '#64748b'} />
          <Text style={[styles.tabLabel, activeTab === 'broadcast' && styles.tabLabelActive]}>Memo</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'stats' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Summary counters */}
          <View style={styles.statsRow}>
            <View style={styles.statsCard}>
              <View style={[styles.iconWrapper, { backgroundColor: '#e0e7ff' }]}>
                <Ionicons name="school-outline" size={20} color="#4f46e5" />
              </View>
              <Text style={styles.statsCount}>{counts.students}</Text>
              <Text style={styles.statsLabel}>Students</Text>
            </View>

            <View style={styles.statsCard}>
              <View style={[styles.iconWrapper, { backgroundColor: '#f3e8ff' }]}>
                <Ionicons name="people-outline" size={20} color="#7c3aed" />
              </View>
              <Text style={styles.statsCount}>{counts.teachers}</Text>
              <Text style={styles.statsLabel}>Teachers</Text>
            </View>

            <View style={styles.statsCard}>
              <View style={[styles.iconWrapper, { backgroundColor: '#fee2e2' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#dc2626" />
              </View>
              <Text style={styles.statsCount}>{counts.hods}</Text>
              <Text style={styles.statsLabel}>HODs</Text>
            </View>
          </View>

          {/* Academic subject list */}
          <Text style={styles.sectionHeading}>Subject Averages</Text>
          <View style={styles.subjectsGrid}>
            {subjectList.map((sub, idx) => (
              <View key={idx} style={[styles.subCard, { borderLeftColor: sub.color }]}>
                <View style={styles.subCardHeader}>
                  <View style={[styles.subIconBox, { backgroundColor: sub.bg }]}>
                    <Ionicons name={sub.icon} size={18} color={sub.color} />
                  </View>
                  <Text style={styles.subCardTitle}>{sub.name}</Text>
                </View>
                <View style={styles.subScoreContainer}>
                  <Text style={[styles.subScoreVal, { color: sub.color }]}>{sub.avg}%</Text>
                  <Text style={styles.subScoreLabel}>Average Score</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${sub.avg}%`, backgroundColor: sub.color }]} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {activeTab === 'directory' && (
        <View style={styles.flexOne}>
          {/* Sub Toggle */}
          <View style={styles.subToggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleBtn, userRoleToggle === 'teacher' && styles.toggleBtnActive]}
              onPress={() => setUserRoleToggle('teacher')}
            >
              <Text style={[styles.toggleBtnText, userRoleToggle === 'teacher' && styles.toggleBtnTextActive]}>
                Teachers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, userRoleToggle === 'student' && styles.toggleBtnActive]}
              onPress={() => setUserRoleToggle('student')}
            >
              <Text style={[styles.toggleBtnText, userRoleToggle === 'student' && styles.toggleBtnTextActive]}>
                Students
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={18} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${userRoleToggle === 'teacher' ? 'teachers' : 'students'}...`}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#94a3b8"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Ionicons name="close-circle" size={18} color="#cbd5e1" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {filteredDirectory.length > 0 ? (
              filteredDirectory.map((item) => (
                <View key={item._id} style={styles.directoryCard}>
                  <View style={styles.dirHeader}>
                    <View style={styles.dirAvatar}>
                      <Ionicons 
                        name={userRoleToggle === 'teacher' ? "school-outline" : "person-outline"} 
                        size={18} 
                        color="#4f46e5" 
                      />
                    </View>
                    <View style={styles.dirInfo}>
                      <Text style={styles.dirName}>{item.name}</Text>
                      <Text style={styles.dirEmail}>{item.email}</Text>
                    </View>

                    {userRoleToggle === 'student' && (
                      <TouchableOpacity 
                        style={styles.downloadBtn}
                        onPress={() => handleShareReportCard(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="download-outline" size={16} color="#059669" />
                        <Text style={styles.downloadBtnText}>Report</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {userRoleToggle === 'student' && item.marks && (
                    <View style={styles.dirMarksRow}>
                      <Text style={styles.dirMarksText}>
                        Math: <Text style={styles.bold}>{item.marks.Mathematics ?? '--'}</Text>  |  
                        Phys: <Text style={styles.bold}>{item.marks.Physics ?? '--'}</Text>  |  
                        Chem: <Text style={styles.bold}>{item.marks.Chemistry ?? '--'}</Text>  |  
                        CS: <Text style={styles.bold}>{item.marks.ComputerScience ?? '--'}</Text>
                      </Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={40} color="#94a3b8" />
                <Text style={styles.emptyStateText}>No matches found.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {activeTab === 'broadcast' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Publish Department Memo</Text>
            
            <Text style={styles.inputLabel}>Memo Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. End Semester Schedule"
              value={memoTitle}
              onChangeText={setMemoTitle}
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.inputLabel}>Content</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter announcement details..."
              multiline
              numberOfLines={4}
              value={memoContent}
              onChangeText={setMemoContent}
              placeholderTextColor="#94a3b8"
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSendMemo}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="send-outline" size={16} color="#ffffff" />
                  <Text style={styles.submitButtonText}>Publish Memo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Bulletin Feed */}
          <Text style={styles.sectionHeading}>Bulletin Archives</Text>
          {updates && updates.length > 0 ? (
            updates.map((up) => (
              <View key={up._id} style={styles.memoHistoryCard}>
                <View style={styles.memoHeader}>
                  <Text style={styles.memoTitle}>{up.title}</Text>
                  <Text style={styles.memoTime}>{new Date(up.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.memoContent}>{up.content}</Text>
                <Text style={styles.memoAuthor}>Posted by: {up.senderName} ({up.senderRole})</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={40} color="#94a3b8" />
              <Text style={styles.emptyStateText}>No memos posted yet.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  flexOne: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#4f46e5',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  tabLabelActive: {
    color: '#4f46e5',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 0.5,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statsCount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  statsLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 4,
    marginBottom: -4,
  },
  subjectsGrid: {
    gap: 12,
  },
  subCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  subIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  subScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  subScoreVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  subScoreLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  progressContainer: {
    height: 5,
    backgroundColor: '#f1f5f9',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  subToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    padding: 2,
    margin: 16,
    marginBottom: 8,
  },
  toggleBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  toggleBtnTextActive: {
    color: '#0f172a',
    fontWeight: '700',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 42,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#0f172a',
    padding: 0,
  },
  directoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  dirHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dirAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dirInfo: {
    flex: 1,
  },
  dirName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  dirEmail: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a3cfbb',
  },
  downloadBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f5132',
  },
  dirMarksRow: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 10,
    paddingTop: 8,
  },
  dirMarksText: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  bold: {
    fontWeight: '700',
    color: '#1e293b',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#0f172a',
  },
  textArea: {
    height: 100,
    paddingTop: 10,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    height: 44,
    marginTop: 16,
    elevation: 1,
    borderBottomWidth: 3,
    borderColor: '#3730a3',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  memoHistoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 4,
  },
  memoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  memoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    flex: 1,
    marginRight: 10,
  },
  memoTime: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  memoContent: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 6,
  },
  memoAuthor: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
});
