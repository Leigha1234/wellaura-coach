import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../app/context/ThemeContext'; // Adjust path to your ThemeContext

interface CheckInSchedulerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSchedule: (scheduleDetails: any) => void;
}

export default function CheckInSchedulerModal({ isVisible, onClose, onSchedule }: CheckInSchedulerModalProps) {
  const { theme } = useTheme();
  const styles = getDynamicStyles(theme);

  const [frequency, setFrequency] = useState<'Weekly' | 'Fortnightly' | 'Monthly'>('Weekly');
  const [dayOfWeek, setDayOfWeek] = useState(5); // Friday
  const [dayOfMonth, setDayOfMonth] = useState('1st');
  const [time, setTime] = useState('10:00');
  const [message, setMessage] = useState("Hey! Just checking in to see how your week has been. Let me know how you're getting on with your plan.");

  const handleSchedule = () => {
    const scheduleDetails = {
      frequency,
      day: frequency === 'Monthly' ? dayOfMonth : dayOfWeek,
      time,
      message,
    };
    onSchedule(scheduleDetails);
    onClose();
  };

  const renderDayOfWeekSelector = () => {
    const days = [{label: 'M', value: 1}, {label: 'T', value: 2}, {label: 'W', value: 3}, {label: 'T', value: 4}, {label: 'F', value: 5}, {label: 'S', value: 6}, {label: 'S', value: 0}];
    return (
      <View style={styles.daySelectorContainer}>
        {days.map(day => (
          <TouchableOpacity 
            key={day.value}
            style={[styles.dayButton, dayOfWeek === day.value && styles.dayButtonSelected]}
            onPress={() => setDayOfWeek(day.value)}
          >
            <Text style={[styles.dayButtonText, dayOfWeek === day.value && styles.dayButtonTextSelected]}>{day.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal visible={isVisible} onRequestClose={onClose} transparent animationType="slide">
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Schedule Automated Check-in</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {/* Frequency Selector */}
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.freqContainer}>
            <TouchableOpacity onPress={() => setFrequency('Weekly')} style={[styles.freqButton, frequency === 'Weekly' && styles.freqButtonSelected]}>
              <Text style={[styles.freqButtonText, frequency === 'Weekly' && styles.freqButtonTextSelected]}>Weekly</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFrequency('Fortnightly')} style={[styles.freqButton, frequency === 'Fortnightly' && styles.freqButtonSelected]}>
              <Text style={[styles.freqButtonText, frequency === 'Fortnightly' && styles.freqButtonTextSelected]}>Fortnightly</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFrequency('Monthly')} style={[styles.freqButton, frequency === 'Monthly' && styles.freqButtonSelected]}>
              <Text style={[styles.freqButtonText, frequency === 'Monthly' && styles.freqButtonTextSelected]}>Monthly</Text>
            </TouchableOpacity>
          </View>

          {/* Day & Time Selector */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{frequency === 'Monthly' ? 'Day of Month' : 'Day of Week'}</Text>
              {frequency === 'Monthly' ? (
                <TextInput style={styles.input} value={dayOfMonth} onChangeText={setDayOfMonth} keyboardType="number-pad" maxLength={2} />
              ) : (
                renderDayOfWeekSelector()
              )}
            </View>
            <View style={{ width: 16 }} />
            <View style={{ flex: 0.8 }}>
              <Text style={styles.label}>Time</Text>
              <TextInput style={styles.input} value={time} onChangeText={setTime} />
            </View>
          </View>

          {/* Message Editor */}
          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={message}
            onChangeText={setMessage}
            multiline
          />

          {/* Confirm Button */}
          <TouchableOpacity style={styles.confirmButton} onPress={handleSchedule}>
            <Text style={styles.confirmButtonText}>Confirm & Schedule</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const getDynamicStyles = (theme: any) => StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContainer: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: theme.textPrimary },
  label: { fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    color: theme.textPrimary,
  },
  messageInput: { height: 120, textAlignVertical: 'top', paddingTop: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  freqContainer: { flexDirection: 'row', backgroundColor: theme.background, borderRadius: 12, padding: 4, marginBottom: 16 },
  freqButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  freqButtonSelected: { backgroundColor: theme.surface, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  freqButtonText: { fontWeight: '600', color: theme.textSecondary },
  freqButtonTextSelected: { color: theme.primary },
  daySelectorContainer: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: theme.background, borderRadius: 12, padding: 4 },
  dayButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  dayButtonSelected: { backgroundColor: theme.primary },
  dayButtonText: { fontWeight: '600', color: theme.textSecondary },
  dayButtonTextSelected: { color: 'white' },
  confirmButton: { marginTop: 24, backgroundColor: theme.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  confirmButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});