import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Link } from 'expo-router';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tinycolor from 'tinycolor2';
import { useTheme } from '../../context/ThemeContext';
import { useTrainingPlan } from '../../context/TrainingPlanContext';

// --- INTERFACES ---
interface Set { reps: number | string; weight: string; completed: boolean; }
interface Exercise { id: string; name: string; sets: Set[]; notes?: string; }
interface Workout { title: string; exercises: Exercise[]; }
interface ProgressEntry { id: string; uri: string; note: string; date: string; }
interface WorkoutLog { id: string; date: string; exercises: Exercise[]; }

// --- ASYNCSTORAGE KEYS ---
const WEIGHT_LOG_KEY = '@weight_log';
const PROGRESS_HISTORY_KEY = '@progress_history';
const WORKOUT_LOGS_KEY = '@workout_logs';

// --- DYNAMIC STYLES ---
const getDynamicStyles = (theme) => {
    const isSurfaceDark = tinycolor(theme.surface).isDark();
    const cardTextColor = isSurfaceDark ? theme.white : theme.textPrimary;
    const cardSecondaryTextColor = isSurfaceDark ? tinycolor(theme.white).setAlpha(0.7).toRgbString() : theme.textSecondary;

    return StyleSheet.create({
      screen: { flex: 1, backgroundColor: theme.background },
      container: { paddingHorizontal: 16, paddingVertical: 24, },
      header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, },
      headerTitle: { fontSize: 28, fontWeight: 'bold', color: theme.textPrimary },
      headerActions: { flexDirection: 'row', alignItems: 'center' },
      iconButton: { backgroundColor: theme.border, padding: 8, borderRadius: 20, marginRight: 10, },
      sectionTitle: { fontSize: 22, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: theme.border, },
      trackerCard: { backgroundColor: theme.surface, borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#9FB1C4', borderWidth: theme.surface === theme.background ? 1 : 0, borderColor: theme.border },
      trackerTitle: { fontSize: 16, fontWeight: '600', color: cardTextColor },
      inputRow: { flexDirection: 'row', marginTop: 12 },
      input: { flex: 1, height: 44, backgroundColor: theme.background, borderRadius: 8, paddingHorizontal: 12, fontSize: 16, borderWidth: 1, borderColor: theme.border, color: theme.textPrimary },
      logButton: { marginLeft: 10, backgroundColor: theme.primary, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center', },
      logButtonText: { color: tinycolor(theme.primary).isDark() ? theme.white : theme.textPrimary, fontWeight: '600', fontSize: 16, },
      loggedText: { marginTop: 8, fontSize: 14, color: cardSecondaryTextColor, fontStyle: 'italic', },
      uploadButton: { height: 150, borderRadius: 12, borderWidth: 2, borderColor: theme.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background, marginTop: 12 },
      uploadPlaceholder: { alignItems: 'center', },
      uploadText: { marginTop: 8, color: cardSecondaryTextColor, fontSize: 16, },
      progressImage: { width: '100%', height: '100%', borderRadius: 10, },
      saveButton: { backgroundColor: '#38A169', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16, },
      saveButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 16, },
      daySelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, },
      dayButton: { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center', backgroundColor: theme.surface, marginHorizontal: 2, elevation: 1, shadowColor: '#9FB1C4', shadowOpacity: 0.1, shadowOffset: {width: 0, height: 2} },
      selectedDayButton: { backgroundColor: theme.primary, },
      dayButtonText: { fontWeight: '600', color: cardSecondaryTextColor, },
      selectedDayButtonText: { color: tinycolor(theme.primary).isDark() ? theme.white : theme.textPrimary, },
      workoutTitle: { fontSize: 22, fontWeight: '600', color: theme.textPrimary, marginBottom: 16, },
      card: { backgroundColor: theme.surface, borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3, shadowColor: "#9FB1C4", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, borderWidth: theme.surface === theme.background ? 1 : 0, borderColor: theme.border },
      cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
      exerciseName: { fontSize: 18, fontWeight: '600', color: cardTextColor, marginBottom: 4, flex: 1 },
      setsContainer: { marginTop: 8, },
      setRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.border, },
      setText: { fontSize: 16, color: cardSecondaryTextColor, width: '25%', },
      restDayCard: { backgroundColor: theme.surface, borderRadius: 12, padding: 32, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#9FB1C4', borderWidth: theme.surface === theme.background ? 1 : 0, borderColor: theme.border },
      restDayText: { fontSize: 20, fontWeight: '600', color: cardTextColor, },
      restDaySubText: { fontSize: 16, color: cardSecondaryTextColor, marginTop: 8, },
      modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', },
      modalContainer: { width: '90%', maxHeight: '80%', backgroundColor: theme.surface, borderRadius: 20, padding: 20, },
      modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: cardTextColor },
      historyEntry: { flexDirection: 'row', backgroundColor: theme.background, borderRadius: 12, padding: 12, marginBottom: 12, },
      historyImage: { width: 80, height: 80, borderRadius: 8, },
      historyTextContainer: { flex: 1, marginLeft: 12, justifyContent: 'center', },
      historyDate: { fontSize: 14, fontWeight: '600', color: cardTextColor },
      historyNote: { fontSize: 14, color: cardSecondaryTextColor, marginTop: 4 },
      noHistoryText: { textAlign: 'center', fontSize: 16, color: cardSecondaryTextColor, padding: 20 },
      closeButton: { backgroundColor: theme.border, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16, },
      closeButtonText: { color: theme.textPrimary, fontWeight: '600', fontSize: 16, },
      planCard: { backgroundColor: theme.surface, borderRadius: 12, padding: 16, marginBottom: 24, elevation: 3, shadowColor: '#9FB1C4', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, borderWidth: theme.surface === theme.background ? 1 : 0, borderColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
      planCardTextContent: { flex: 1, },
      planCardTitle: { fontSize: 18, fontWeight: 'bold', color: cardTextColor, textAlign: 'left', },
      planCardSubtitle: { fontSize: 14, color: theme.primary, fontWeight: '600', marginTop: 4, textAlign: 'left', },
    });
};

// --- SUB-COMPONENTS ---
const ExerciseCard: React.FC<{ exercise: Exercise; styles: any; onEdit?: () => void }> = ({ exercise, styles, onEdit }) => {
    const [sets, setSets] = useState(exercise.sets);
    const toggleSetCompletion = (setIndex: number) => { const newSets = [...sets]; newSets[setIndex].completed = !newSets[setIndex].completed; setSets(newSets); };
    return (<View style={styles.card}><View style={styles.cardHeader}><Text style={styles.exerciseName}>{exercise.name}</Text>{onEdit && (<TouchableOpacity onPress={onEdit}><Ionicons name="pencil-outline" size={20} color={styles.dayButtonText.color} /></TouchableOpacity>)}</View>{exercise.notes && <Text style={styles.exerciseNotes}>{exercise.notes}</Text>}<View style={styles.setsContainer}>{sets.map((set, index) => (<View key={index} style={styles.setRow}><Text style={styles.setText}>Set {index + 1}</Text><Text style={styles.setText}>{set.reps} reps</Text><Text style={styles.setText}>{set.weight}</Text><TouchableOpacity onPress={() => toggleSetCompletion(index)}><Ionicons name={set.completed ? "checkbox" : "square-outline"} size={24} color={set.completed ? "#38A169" : "#a0aec0"} /></TouchableOpacity></View>))}</View></View>);
};
const ProgressHistoryModal: React.FC<{ isVisible: boolean, onClose: () => void, history: ProgressEntry[], styles: any }> = ({ isVisible, onClose, history, styles }) => {
    return (<Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}><View style={styles.modalBackdrop}><View style={styles.modalContainer}><Text style={styles.modalTitle}>Progress History</Text><FlatList data={history} keyExtractor={(item) => item.id} renderItem={({ item }) => (<View style={styles.historyEntry}><Image source={{ uri: item.uri }} style={styles.historyImage} /><View style={styles.historyTextContainer}><Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString()}</Text><Text style={styles.historyNote}>{item.note || 'No note.'}</Text></View></View>)} ListEmptyComponent={<Text style={styles.noHistoryText}>No progress photos have been saved yet.</Text>} /><TouchableOpacity style={styles.closeButton} onPress={onClose}><Text style={styles.closeButtonText}>Close</Text></TouchableOpacity></View></View></Modal>);
};
const WorkoutHistoryModal: React.FC<{ isVisible: boolean, onClose: () => void, history: WorkoutLog[], styles: any }> = ({ isVisible, onClose, history, styles }) => {
    return (<Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}><View style={styles.modalBackdrop}><View style={styles.modalContainer}><Text style={styles.modalTitle}>Past Workouts</Text><FlatList data={history} keyExtractor={(item) => item.id} renderItem={({ item }) => (<View style={styles.historyEntry}><View style={styles.historyTextContainer}><Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString()}</Text><Text style={styles.historyNote}>{item.exercises.length} exercises logged</Text></View></View>)} ListEmptyComponent={<Text style={styles.noHistoryText}>No workouts have been logged yet.</Text>} /><TouchableOpacity style={styles.closeButton} onPress={onClose}><Text style={styles.closeButtonText}>Close</Text></TouchableOpacity></View></View></Modal>);
};

// --- VIEW COMPONENTS FOR EACH MODE ---
const TrackPlanView: React.FC<{ styles: any; }> = ({ styles }) => {
    const { activePlan } = useTrainingPlan();
    const [selectedDay, setSelectedDay] = useState(moment().format('dddd'));
    const selectedWorkout = activePlan ? activePlan[selectedDay as keyof typeof activePlan] : null;
    const daysOfWeek = moment.weekdays();
    const handleEditExercise = (exercise) => { Alert.alert("Edit Exercise", `Editing ${exercise.name}. (Full functionality to be added)`); };
    return (
        <View><Text style={styles.sectionTitle}>This Week's Plan</Text><View style={styles.daySelector}>{daysOfWeek.map(day => <TouchableOpacity key={day} style={[styles.dayButton, selectedDay === day && styles.selectedDayButton]} onPress={() => setSelectedDay(day)}><Text style={[styles.dayButtonText, selectedDay === day && styles.selectedDayButtonText]}>{moment(day, 'dddd').format('ddd')}</Text></TouchableOpacity>)}</View>{selectedWorkout ? (<><Text style={styles.workoutTitle}>{selectedWorkout.title}</Text>{selectedWorkout.exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} styles={styles} onEdit={() => handleEditExercise(exercise)} />)}</>) : (<View style={styles.restDayCard}><Text style={styles.restDayText}>Rest Day</Text><Text style={styles.restDaySubText}>No workout scheduled for {selectedDay}.</Text></View>)}</View>
    );
};
const LogWorkoutView: React.FC<{ styles: any; setWorkoutLogs: (updater: (logs: WorkoutLog[]) => WorkoutLog[]) => void }> = ({ styles, setWorkoutLogs }) => {
    const [currentExercises, setCurrentExercises] = useState([]);
    const [exerciseName, setExerciseName] = useState('');
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const handleAddExercise = () => { if (!exerciseName || !sets || !reps) { Alert.alert("Missing Info", "Please fill out all fields."); return; } const newEx = { id: Date.now().toString(), name: exerciseName, sets: Array(parseInt(sets, 10)).fill({ reps, weight: 'N/A', completed: false }) }; setCurrentExercises(prev => [...prev, newEx]); setExerciseName(''); setSets(''); setReps(''); };
    const handleSaveWorkout = () => { if (currentExercises.length === 0) { Alert.alert("No Exercises", "Please add at least one exercise to log."); return; } const newLog: WorkoutLog = { id: Date.now().toString(), date: new Date().toISOString(), exercises: currentExercises }; setWorkoutLogs(prev => [newLog, ...prev]); setCurrentExercises([]); Alert.alert("Workout Saved!", "Your session has been logged to your history."); };
    return (
        <View><Text style={styles.sectionTitle}>Log Today's Workout</Text>{currentExercises.map(ex => <ExerciseCard key={ex.id} exercise={ex} styles={styles} />)}<View style={styles.card}><Text style={styles.exerciseName}>Add Exercise</Text><TextInput style={styles.input} placeholder="Exercise Name" value={exerciseName} onChangeText={setExerciseName} placeholderTextColor={styles.setText.color} /><View style={{flexDirection: 'row', gap: 10}}><TextInput style={[styles.input, {flex: 1}]} placeholder="Sets" value={sets} onChangeText={setSets} keyboardType="numeric" placeholderTextColor={styles.setText.color}/><TextInput style={[styles.input, {flex: 1}]} placeholder="Reps" value={reps} onChangeText={setReps} keyboardType="numeric" placeholderTextColor={styles.setText.color}/></View><TouchableOpacity style={styles.logButton} onPress={handleAddExercise}><Text style={styles.logButtonText}>+ Add to Workout</Text></TouchableOpacity></View>{currentExercises.length > 0 && <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkout}><Text style={styles.saveButtonText}>Save Workout</Text></TouchableOpacity>}</View>
    );
};


// --- MAIN PAGE COMPONENT ---
const WorkoutPage: React.FC = () => {
  const { theme } = useTheme();
  const { activePlan, activePlanMeta } = useTrainingPlan();
  const [loggedWeight, setLoggedWeight] = useState<string | null>(null);
  const [progressHistory, setProgressHistory] = useState<ProgressEntry[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);
  const [isWorkoutHistoryModalVisible, setWorkoutHistoryModalVisible] = useState(false);
  const [weight, setWeight] = useState('');
  const [progressPicUri, setProgressPicUri] = useState(null);
  const [progressNote, setProgressNote] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const weightData = await AsyncStorage.getItem(WEIGHT_LOG_KEY); if (weightData !== null) setLoggedWeight(weightData);
        const progressData = await AsyncStorage.getItem(PROGRESS_HISTORY_KEY); if (progressData !== null) setProgressHistory(JSON.parse(progressData));
        const workoutData = await AsyncStorage.getItem(WORKOUT_LOGS_KEY); if (workoutData !== null) setWorkoutLogs(JSON.parse(workoutData));
      } catch (e) { console.error("Failed to load data from storage", e); }
    };
    loadData();
  }, []);

  useEffect(() => { if (loggedWeight !== null) AsyncStorage.setItem(WEIGHT_LOG_KEY, loggedWeight); }, [loggedWeight]);
  useEffect(() => { if (progressHistory.length > 0) AsyncStorage.setItem(PROGRESS_HISTORY_KEY, JSON.stringify(progressHistory)); }, [progressHistory]);
  useEffect(() => { if (workoutLogs.length > 0) AsyncStorage.setItem(WORKOUT_LOGS_KEY, JSON.stringify(workoutLogs)); }, [workoutLogs]);

  if (!theme) return null;
  const styles = getDynamicStyles(theme);

  const handleLogWeight = () => { if (weight) { setLoggedWeight(weight); Alert.alert("Success!", `Weight logged at ${weight} kg.`); } };
  const pickImage = async () => { const p = await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!p.granted) { alert("Permission required"); return; } const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [3, 4], quality: 0.5 }); if (!r.canceled) setProgressPicUri(r.assets[0].uri); };
  const handleSaveProgress = () => { if (!progressPicUri) { Alert.alert("No Photo", "Please upload a photo before saving."); return; } const newEntry: ProgressEntry = { id: Date.now().toString(), uri: progressPicUri, note: progressNote, date: new Date().toISOString() }; setProgressHistory(prev => [newEntry, ...prev]); setProgressPicUri(null); setProgressNote(''); Alert.alert("Saved!", "Your progress has been logged."); };

  return (
    <SafeAreaView style={styles.screen}>
      <ProgressHistoryModal isVisible={isHistoryModalVisible} onClose={() => setHistoryModalVisible(false)} history={progressHistory} styles={styles} />
      <WorkoutHistoryModal isVisible={isWorkoutHistoryModalVisible} onClose={() => setWorkoutHistoryModalVisible(false)} history={workoutLogs} styles={styles} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Daily Dashboard</Text>
            <View style={styles.headerActions}>
                <TouchableOpacity style={styles.iconButton} onPress={() => setHistoryModalVisible(true)}><Ionicons name="images-outline" size={22} color={styles.headerTitle.color} /></TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setWorkoutHistoryModalVisible(true)}><Ionicons name="list-circle-outline" size={22} color={styles.headerTitle.color} /></TouchableOpacity>
            </View>
        </View>

        <Link href="/trainingplan" asChild>
          <TouchableOpacity style={styles.planCard}>
            <View style={styles.planCardTextContent}>
              <Text style={styles.planCardTitle}>Training Plans</Text>
              {activePlanMeta?.name ? 
                (<Text style={styles.planCardSubtitle}>Current: {activePlanMeta.name}</Text>) :
                (<Text style={[styles.planCardSubtitle, {color: styles.dayButtonText.color}]}>Choose a plan to get started</Text>)
              }
            </View>
            <Ionicons name="chevron-forward" size={24} color={styles.planCardSubtitle.color} />
          </TouchableOpacity>
        </Link>
        
        <View>
          <Text style={styles.sectionTitle}>Daily Check-in</Text>
          <View style={styles.trackerCard}><Text style={styles.trackerTitle}>Track Your Weight</Text><View style={styles.inputRow}><TextInput style={styles.input} placeholder="Enter weight in kg" keyboardType="numeric" value={weight} onChangeText={setWeight} placeholderTextColor={styles.setText.color} /><TouchableOpacity style={styles.logButton} onPress={handleLogWeight}><Text style={styles.logButtonText}>Log</Text></TouchableOpacity></View>{loggedWeight && <Text style={styles.loggedText}>Last log: {loggedWeight} kg</Text>}</View>
          <View style={styles.trackerCard}><Text style={styles.trackerTitle}>Progress Photo</Text><TouchableOpacity style={styles.uploadButton} onPress={pickImage}>{progressPicUri ? <Image source={{ uri: progressPicUri }} style={styles.progressImage} /> : <View style={styles.uploadPlaceholder}><Ionicons name="camera-outline" size={32} color={styles.uploadText.color} /><Text style={styles.uploadText}>Upload Picture</Text></View>}</TouchableOpacity><TextInput style={[styles.input, {marginTop: 12}]} placeholder="Add a note... eg - down 1kg" value={progressNote} onChangeText={setProgressNote} placeholderTextColor={styles.setText.color} /><TouchableOpacity style={styles.saveButton} onPress={handleSaveProgress}><Text style={styles.saveButtonText}>Save Progress</Text></TouchableOpacity></View>
        </View>

        {!activePlan ? (
            <LogWorkoutView styles={styles} setWorkoutLogs={setWorkoutLogs} />
        ) : (
            <TrackPlanView styles={styles} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutPage;