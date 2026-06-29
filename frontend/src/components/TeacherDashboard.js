import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TeacherDashboard({ 
  students, 
  updates, 
  onUpdateMarks, 
  onCreateUpdate 
}) {
  const [activeTab, setActiveTab] = useState('students');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isMarksModalVisible, setIsMarksModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Marks inputs state
  const [math, setMath] = useState('');
  const [physics, setPhysics] = useState('');
  const [chem, setChem] = useState('');
  const [cs, setCs] = useState('');

  // Notice form state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);

  const handleOpenMarksModal = (student) => {
    setSelectedStudent(student);
    setMath(String(student.marks?.Mathematics ?? ''));
    setPhysics(String(student.marks?.Physics ?? ''));
    setChem(String(student.marks?.Chemistry ?? ''));
    setCs(String(student.marks?.ComputerScience ?? ''));
    setIsMarksModalVisible(true);
  };

  const handleSaveMarks = async () => {
    if (!selectedStudent) return;
    
    const m = Number(math);
    const p = Number(physics);
    const c = Number(chem);
    const comp = Number(cs);

    if (
      isNaN(m) || m < 0 || m > 100 ||
      isNaN(p) || p < 0 || p > 100 ||
      isNaN(c) || c < 0 || c > 100 ||
      isNaN(comp) || comp < 0 || comp > 100
    ) {
      Alert.alert('Invalid Marks', 'Please enter numeric marks between 0 and 100.');
      return;
    }

    try {
      await onUpdateMarks(selectedStudent._id, {
        Mathematics: m,
        Physics: p,
        Chemistry: c,
        ComputerScience: comp
      });
      setIsMarksModalVisible(false);
      Alert.alert('Success', 'Student marks updated successfully.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update marks.');
    }
  };

  const handleSendNotice = async () => {
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      Alert.alert('Required Fields', 'Please fill in both title and content.');
      return;
    }

    setIsSubmittingNotice(true);
    try {
      await onCreateUpdate(noticeTitle, noticeContent);
      setNoticeTitle('');
      setNoticeContent('');
      Alert.alert('Success', 'Announcement broadcasted successfully.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to post announcement.');
    } finally {
      setIsSubmittingNotice(false);
    }
  };

  const calculateStudentAvg = (marks = {}) => {
    const m = marks.Mathematics ?? 0;
    const p = marks.Physics ?? 0;
    const c = marks.Chemistry ?? 0;
    const cs = marks.ComputerScience ?? 0;
    return Math.round((m + p + c + cs) / 4);
  };

  const calculateGrade = (score) => {
    if (score >= 90) return { name: 'A+', bg: '#ecfdf5', text: '#047857' };
    if (score >= 80) return { name: 'A', bg: '#f0fdfa', text: '#0f766e' };
    if (score >= 70) return { name: 'B', bg: '#e0e7ff', text: '#4338ca' };
    if (score >= 60) return { name: 'C', bg: '#e0f2fe', text: '#0369a1' };
    if (score >= 50) return { name: 'D', bg: '#fef3c7', text: '#b45309' };
    return { name: 'F', bg: '#fee2e2', text: '#b91c1c' };
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'students' && styles.tabButtonActive]}
          onPress={() => setActiveTab('students')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="people-outline" 
            size={18} 
            color={activeTab === 'students' ? '#4f46e5' : '#64748b'} 
          />
          <Text style={[styles.tabText, activeTab === 'students' && styles.tabTextActive]}>
            Roster ({students.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'bulletin' && styles.tabButtonActive]}
          onPress={() => setActiveTab('bulletin')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="megaphone-outline" 
            size={18} 
            color={activeTab === 'bulletin' ? '#4f46e5' : '#64748b'} 
          />
          <Text style={[styles.tabText, activeTab === 'bulletin' && styles.tabTextActive]}>
            Notice Board
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Contents */}
      {activeTab === 'students' ? (
        <View style={styles.flexOne}>
          {/* Search bar */}
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={18} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94a3b8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#cbd5e1" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((st) => {
                const avg = calculateStudentAvg(st.marks);
                const grade = calculateGrade(avg);
                return (
                  <View key={st._id} style={styles.studentCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {st.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName} numberOfLines={1}>{st.name}</Text>
                        <Text style={styles.studentEmail} numberOfLines={1}>{st.email}</Text>
                      </View>
                      <View style={[styles.avgBadge, { backgroundColor: grade.bg }]}>
                        <Text style={[styles.avgBadgeText, { color: grade.text }]}>{avg}%</Text>
                        <Text style={[styles.gradeBadgeText, { color: grade.text }]}>{grade.name}</Text>
                      </View>
                    </View>

                    {/* Marks Overview Grid */}
                    <View style={styles.marksGrid}>
                      <View style={styles.markCell}>
                        <Text style={styles.markLabel}>Math</Text>
                        <Text style={styles.markVal}>{st.marks?.Mathematics ?? '--'}</Text>
                      </View>
                      <View style={styles.markCell}>
                        <Text style={styles.markLabel}>Physics</Text>
                        <Text style={styles.markVal}>{st.marks?.Physics ?? '--'}</Text>
                      </View>
                      <View style={styles.markCell}>
                        <Text style={styles.markLabel}>Chem</Text>
                        <Text style={styles.markVal}>{st.marks?.Chemistry ?? '--'}</Text>
                      </View>
                      <View style={styles.markCell}>
                        <Text style={styles.markLabel}>CompSci</Text>
                        <Text style={styles.markVal}>{st.marks?.ComputerScience ?? '--'}</Text>
                      </View>
                    </View>

                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => handleOpenMarksModal(st)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="create-outline" size={16} color="#4f46e5" />
                      <Text style={styles.editButtonText}>Update Subject Marks</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color="#94a3b8" />
                <Text style={styles.emptyStateText}>No students matching "{searchQuery}" found.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* New notice form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Broadcast Notice to Students</Text>
            
            <Text style={styles.inputLabel}>Notice Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Tomorrow's Assignment Submissions"
              value={noticeTitle}
              onChangeText={setNoticeTitle}
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.inputLabel}>Content / Message</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Provide instructions, assignments, or updates..."
              multiline
              numberOfLines={4}
              value={noticeContent}
              onChangeText={setNoticeContent}
              placeholderTextColor="#94a3b8"
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSendNotice}
              disabled={isSubmittingNotice}
              activeOpacity={0.8}
            >
              {isSubmittingNotice ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="send-outline" size={16} color="#ffffff" />
                  <Text style={styles.submitButtonText}>Broadcast Notice</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* History */}
          <Text style={styles.sectionHeading}>Notice History</Text>
          {updates && updates.length > 0 ? (
            updates.map((up) => (
              <View key={up._id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>{up.title}</Text>
                  <Text style={styles.historyTime}>
                    {new Date(up.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.historyContent}>{up.content}</Text>
                <Text style={styles.historyAuthor}>Posted by: {up.senderName} ({up.senderRole})</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={40} color="#94a3b8" />
              <Text style={styles.emptyStateText}>No announcements posted yet.</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Update Marks Modal */}
      <Modal
        visible={isMarksModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsMarksModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Update Marks</Text>
                <Text style={styles.modalSubtitle}>{selectedStudent?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setIsMarksModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Mathematics */}
              <View style={styles.formGroup}>
                <Text style={styles.formGroupLabel}>Mathematics Mark (0 - 100)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={math}
                  onChangeText={setMath}
                  placeholder="Enter score"
                  maxLength={3}
                />
              </View>

              {/* Physics */}
              <View style={styles.formGroup}>
                <Text style={styles.formGroupLabel}>Physics Mark (0 - 100)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={physics}
                  onChangeText={setPhysics}
                  placeholder="Enter score"
                  maxLength={3}
                />
              </View>

              {/* Chemistry */}
              <View style={styles.formGroup}>
                <Text style={styles.formGroupLabel}>Chemistry Mark (0 - 100)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={chem}
                  onChangeText={setChem}
                  placeholder="Enter score"
                  maxLength={3}
                />
              </View>

              {/* Computer Science */}
              <View style={styles.formGroup}>
                <Text style={styles.formGroupLabel}>Computer Science Mark (0 - 100)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={cs}
                  onChangeText={setCs}
                  placeholder="Enter score"
                  maxLength={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelModalBtn}
                onPress={() => setIsMarksModalVisible(false)}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveModalBtn}
                onPress={handleSaveMarks}
              >
                <Text style={styles.saveModalText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#4f46e5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#4f46e5',
    fontWeight: '700',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0f172a',
    padding: 0, // fixes vertical offsets in android inputs
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  studentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4f46e5',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  studentEmail: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 1,
  },
  avgBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 44,
  },
  avgBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  gradeBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: -2,
  },
  marksGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  markCell: {
    flex: 1,
    alignItems: 'center',
  },
  markLabel: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  markVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#f5f3ff',
    borderRadius: 10,
    borderWidth: 1,
    borderBottomWidth: 2,
    borderColor: '#ddd6fe',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 13,
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
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 4,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 0.5,
    marginBottom: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    flex: 1,
    marginRight: 10,
  },
  historyTime: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  historyContent: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 6,
  },
  historyAuthor: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  modalBody: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 12,
  },
  formGroupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelModalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderBottomWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  cancelModalText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  saveModalBtn: {
    flex: 2,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
    borderBottomWidth: 3,
    borderColor: '#3730a3',
  },
  saveModalText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
