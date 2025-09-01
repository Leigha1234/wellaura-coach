import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Link, Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import tinycolor from 'tinycolor2';
import { useTheme } from '../context/ThemeContext';
import { useTrainingPlan } from '../context/TrainingPlanContext';
import { defaultPlans } from '../data/plans';

// --- DYNAMIC STYLES ---
const getDynamicStyles = (theme) => {
    const isSurfaceDark = tinycolor(theme.surface).isDark();
    const cardTextColor = isSurfaceDark ? theme.white : theme.textPrimary;
    const cardSecondaryTextColor = isSurfaceDark ? tinycolor(theme.white).setAlpha(0.7).toRgbString() : theme.textSecondary;

    return StyleSheet.create({
      screen: { flex: 1, backgroundColor: theme.background },
      container: { paddingHorizontal: 16, paddingVertical: 24, },
      header: { marginBottom: 16, },
      headerTitle: { fontSize: 28, fontWeight: 'bold', color: theme.textPrimary },
      headerSubtitle: { fontSize: 16, color: theme.textSecondary, marginTop: 4, },
      editCurrentButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: tinycolor(theme.primary).setAlpha(0.15).toRgbString(), borderRadius: 12, padding: 16, marginBottom: 12, },
      editCurrentButtonText: { fontSize: 18, fontWeight: '600', color: theme.primary, marginLeft: 12, },
      createButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.border, borderRadius: 12, padding: 16, marginBottom: 24, },
      createButtonText: { fontSize: 18, fontWeight: '600', color: theme.textPrimary, marginLeft: 12, },
      sectionTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 12, marginTop: 8, },
      planCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 12, padding: 20, marginBottom: 12, elevation: 2, shadowColor: '#9FB1C4', borderWidth: theme.surface === theme.background ? 1 : 0, borderColor: theme.border, },
      planInfo: { flex: 1, marginHorizontal: 16, },
      planName: { fontSize: 18, fontWeight: '600', color: cardTextColor, },
      planGoal: { fontSize: 14, color: cardSecondaryTextColor, marginTop: 4, },
      modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', },
      modalContainer: { backgroundColor: theme.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingTop: 28, height: '75%', },
      modalPlanName: { fontSize: 26, fontWeight: 'bold', color: cardTextColor, textAlign: 'center', marginBottom: 24, },
      sliderContainer: { marginBottom: 24, },
      sliderLabel: { fontSize: 16, color: cardSecondaryTextColor, marginBottom: 8, },
      sliderValue: { fontWeight: 'bold', color: cardTextColor, },
      planDetails: { flex: 1, },
      phaseTitle: { fontSize: 18, fontWeight: 'bold', color: cardTextColor, marginTop: 16, marginBottom: 8, },
      phaseDetail: { fontSize: 16, color: cardSecondaryTextColor, lineHeight: 24, },
      chooseButton: { backgroundColor: theme.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, },
      chooseButtonText: { color: tinycolor(theme.primary).isDark() ? theme.white : theme.textPrimary, fontWeight: 'bold', fontSize: 16, },
      closeButton: { paddingVertical: 16, alignItems: 'center', },
      closeButtonText: { color: cardSecondaryTextColor, fontWeight: '600', fontSize: 16, },
    });
}


// --- MODAL COMPONENT ---
const PlanDetailModal = ({ isVisible, onClose, plan, styles }) => {
  const { setActivePlan, setActivePlanMeta } = useTrainingPlan();
  const router = useRouter();

  if (!plan) return null;

  const [duration, setDuration] = useState(plan.minWeeks);
  const planDetails = plan.generateDetails(duration);

  useEffect(() => {
    if (plan) {
      setDuration(plan.minWeeks);
    }
  }, [plan]);

  const handleChoosePlan = () => {
    setActivePlan(plan.weeklyMap);
    setActivePlanMeta({ name: plan.name, isCustom: false });
    onClose();
    router.navigate('/workout');
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalPlanName}>{plan.name}</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Duration: <Text style={styles.sliderValue}>{duration} weeks</Text></Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={plan.minWeeks}
              maximumValue={plan.maxWeeks}
              step={1}
              value={duration}
              onValueChange={setDuration}
              minimumTrackTintColor={styles.chooseButton.backgroundColor}
              maximumTrackTintColor={styles.closeButtonText.color}
              thumbTintColor={styles.chooseButton.backgroundColor}
            />
          </View>
          <ScrollView style={styles.planDetails}>
            <Text style={styles.phaseTitle}>Phase 1</Text>
            <Text style={styles.phaseDetail}>{planDetails.phase1}</Text>
            <Text style={styles.phaseTitle}>Phase 2</Text>
            <Text style={styles.phaseDetail}>{planDetails.phase2}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.chooseButton} onPress={handleChoosePlan}>
            <Text style={styles.chooseButtonText}>Choose This Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


const TrainingPlanPage: React.FC = () => {
  const { theme } = useTheme();
  const { activePlanMeta } = useTrainingPlan();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  if (!theme) {
    return null;
  }

  const styles = getDynamicStyles(theme);

  const openPlanModal = (plan) => {
    setSelectedPlan(plan);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ 
          title: "Training Plans",
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.textPrimary,
          headerTitleStyle: { color: theme.textPrimary },
      }} />
      <PlanDetailModal 
        isVisible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        plan={selectedPlan} 
        styles={styles}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Select a Plan</Text>
            <Text style={styles.headerSubtitle}>Choose a template or create your own.</Text>
        </View>
        
        {activePlanMeta.isCustom && (
            <Link href={{ pathname: "/createplan", params: { mode: 'edit' } }} asChild>
                <TouchableOpacity style={styles.editCurrentButton}>
                    <Ionicons name="pencil-outline" size={24} color={theme.primary} />
                    <Text style={styles.editCurrentButtonText}>Edit Your Custom Plan</Text>
                </TouchableOpacity>
            </Link>
        )}

        <Link href="/createplan" asChild>
          <TouchableOpacity style={styles.createButton}>
            <Ionicons name="add-circle-outline" size={24} color={theme.textPrimary} />
            <Text style={styles.createButtonText}>Create New Custom Plan</Text>
          </TouchableOpacity>
        </Link>
        
        <Text style={styles.sectionTitle}>Default Plans</Text>
        {defaultPlans.map(plan => (
          <TouchableOpacity key={plan.id} style={styles.planCard} onPress={() => openPlanModal(plan)}>
            <Ionicons name={plan.icon as any} size={28} color={styles.planName.color} />
            <View style={styles.planInfo}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planGoal}>{plan.goal}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={24} color={styles.planGoal.color} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrainingPlanPage;