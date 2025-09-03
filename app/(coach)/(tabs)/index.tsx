import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { LayoutAnimation, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, UIManager, View } from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, { interpolateColor, runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import tinycolor from "tinycolor2";

// Import the extracted modal components
import { AddWidgetModal } from "../../../components/AddWidgetModal";
import { ColorPickerModal } from "../../../components/ColorPickerModal";
import { ThemeEditorModal } from "../../../components/ThemeEditorModal";
import TodaySnapshotModal from "../../../components/TodaySnapshot";
import { WeatherWidget } from "../../../components/WeatherWidget";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useWellaura } from "../../WellauraContext";


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- CONSTANTS ---
const PRESET_THEMES = [
    { name: "Wellaura's Whisper", colors: { primary: '#395D48', accent: '#8CBCA7', background: '#E4ECEA', surface: '#FFFFFF', textPrimary: '#2C2C2C', textSecondary: '#395D48', border: '#D8E0D9', white: '#FFFFFF' }},
    { name: 'Ocean Breeze', colors: { primary: '#3B82F6', accent: '#93C5FD', background: '#F0F9FF', surface: '#FFFFFF', textPrimary: '#1E3A8A', textSecondary: '#3B82F6', border: '#DBEAFE', white: '#FFFFFF' }},
    { name: 'Rose Quartz', colors: { primary: '#EC4899', accent: '#F9A8D4', background: '#FFF1F2', surface: '#FFFFFF', textPrimary: '#831843', textSecondary: '#EC4899', border: '#FCE7F3', white: '#FFFFFF' }},
    { name: 'Amethyst Sky', colors: { primary: '#8B5CF6', accent: '#C4B5FD', background: '#F5F3FF', surface: '#FFFFFF', textPrimary: '#4C1D95', textSecondary: '#8B5CF6', border: '#EDE9FE', white: '#FFFFFF' }},
    { name: 'Golden Hour', colors: { primary: '#F97716', accent: '#FBBF24', background: '#FFF7ED', surface: '#FFFFFF', textPrimary: '#78350F', textSecondary: '#F97716', border: '#FEF3C7', white: '#FFFFFF' }},
    { name: 'Midnight', colors: { primary: '#9CA3AF', accent: '#D1D5DB', background: '#111827', surface: '#1F2937', textPrimary: '#F9FAFB', textSecondary: '#9CA3AF', border: '#374151', white: '#FFFFFF' }},
    { name: 'Deep Ocean', colors: { primary: '#60A5FA', accent: '#93C5FD', background: '#1E293B', surface: '#334155', textPrimary: '#F1F5F9', textSecondary: '#94A3B8', border: '#475569', white: '#FFFFFF' }},
    { name: 'Forest Night', colors: { primary: '#34D399', accent: '#A7F3D0', background: '#1A2421', surface: '#25342E', textPrimary: '#F0FDF4', textSecondary: '#A1AFAF', border: '#3A4A44', white: '#FFFFFF' }},
    { name: 'Cosmic Ray', colors: { primary: '#A5B4FC', accent: '#C7D2FE', background: '#1E1B4B', surface: '#312E81', textPrimary: '#F0F9FF', textSecondary: '#A5B4FC', border: '#4338CA', white: '#FFFFFF' }},
    { name: 'Crimson Ember', colors: { primary: '#F87171', accent: '#FCA5A5', background: '#450A0A', surface: '#7F1D1D', textPrimary: '#FEF2F2', textSecondary: '#F87171', border: '#991B1B', white: '#FFFFFF' }},
];

// --- STORAGE KEYS (Coach-specific) ---
const WIDGETS_STORAGE_KEY = '@coach_widgets_layout_v1';
const LAYOUT_STORAGE_KEY = '@coach_layout_columns_v1';
const THEME_STORAGE_KEY = '@coach_theme_v1';

// --- DYNAMIC STYLES ---
const getDynamicStyles = (theme: any) => {
    if (!theme) return StyleSheet.create({});
    const isSurfaceDark = tinycolor(theme.surface).isDark();
    const cardTextColor = isSurfaceDark ? theme.white : theme.textPrimary;
    const cardSecondaryTextColor = isSurfaceDark ? tinycolor(theme.white).setAlpha(0.7).toRgbString() : theme.textSecondary;

    return StyleSheet.create({
      screen: { flex: 1, backgroundColor: theme.background },
      container: { flex: 1 },
      headerContainer: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 25 : 0, paddingBottom: 16 },
      headerWelcome: { padding: 20, backgroundColor: theme.surface, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, borderWidth: tinycolor.equals(theme.background, theme.surface) ? 1 : 0, borderColor: tinycolor.equals(theme.background, theme.surface) ? theme.border : 'transparent' },
      headerName: { fontSize: 18, fontWeight: "bold", color: cardTextColor },
      headerSubtitle: { fontSize: 14, color: cardSecondaryTextColor, marginTop: 4 },
      headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
      iconButton: { padding: 10, backgroundColor: theme.border, borderRadius: 20, justifyContent: 'center', alignItems: 'center', width: 42, height: 42 },
      todayButton: { padding: 10, backgroundColor: tinycolor(theme.primary).setAlpha(0.12).toRgbString(), borderRadius: 20, width: 42, height: 42, justifyContent: 'center', alignItems: 'center' },
      widgetContainer: { padding: 8 },
      card: { borderRadius: 20, shadowColor: "#9FB1C4", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3, overflow: "hidden", padding: 16, borderWidth: tinycolor.equals(theme.background, theme.surface) ? 1 : 0, borderColor: tinycolor.equals(theme.background, theme.surface) ? theme.border : 'transparent' },
      linkArea: { flex: 1, paddingTop: 12 },
      cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
      cardTitleContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
      cardTitle: { fontWeight: "bold", fontSize: 18, color: cardTextColor },
      cardText: { fontSize: 14, color: cardSecondaryTextColor, lineHeight: 22 },
      dateText: { fontSize: 14, fontWeight: "bold", color: cardTextColor, marginBottom: 10 },
      subTitle: { fontWeight: "bold", marginTop: 4, marginBottom: 6, color: cardTextColor, fontSize: 14 },
      skeleton: { width: '100%', borderRadius: 16, marginTop: 12 },
      resizeHandle: { position: "absolute", bottom: 0, right: 0, width: 30, height: 30, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 4 },
      editButton: { padding: 5, backgroundColor: tinycolor(cardTextColor).setAlpha(0.1).toRgbString(), borderRadius: 15 },
      deleteButton: { position: 'absolute', top: 10, left: 10, backgroundColor: '#EF4444', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
      deleteButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, lineHeight: 20 },
      insightsCard: { backgroundColor: tinycolor(theme.accent).setAlpha(0.2).toRgbString(), borderRadius: 20, padding: 20, marginTop: 20, borderWidth: 1, borderColor: tinycolor(theme.accent).setAlpha(0.3).toRgbString(), overflow: 'hidden' },
      insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, },
      insightsContent: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: tinycolor(theme.accent).setAlpha(0.3).toRgbString() },
      insightText: { fontSize: 15, color: theme.textPrimary, lineHeight: 22, marginBottom: 8 },
      clientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
      clientAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
      clientInfo: { flex: 1 },
      clientName: { fontWeight: '500', color: cardTextColor, fontSize: 15, marginBottom: 2 },
      clientStatusText: { fontSize: 13, color: cardSecondaryTextColor },
      statusIndicator: { width: 10, height: 10, borderRadius: 5, marginLeft: 10 },
      statusActive: { backgroundColor: '#22C55E' },
      statusInactive: { backgroundColor: '#9CA3AF' },
      workoutExerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    });
};

// --- WIDGET COMPONENTS ---
const SkeletonLoader = ({ height, styles }: any) => { const shimmer = useSharedValue(0); useEffect(() => { shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, false); }, []); const animatedStyle = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(shimmer.value, [0, 0.5, 1], [styles.screen.backgroundColor, styles.card.backgroundColor, styles.screen.backgroundColor]) })); return <Animated.View style={[styles.skeleton, { height: height - 40 }, animatedStyle]} />; };
const ClientDashboardWidget = React.memo(({ styles }: any) => { /* ... Your component code ... */ return <View><Text style={styles.cardText}>Client overview will be here.</Text></View> });
const CalendarWidget = React.memo(({ styles }: any) => { /* ... Your component code ... */ return <View><Text style={styles.cardText}>Calendar content will be here.</Text></View> });
const WorkoutWidget = React.memo(({ styles }: any) => { /* ... Your component code ... */ return <View><Text style={styles.cardText}>Workout content will be here.</Text></View> });
const InsightsWidget = React.memo(({ theme, styles }: any) => { /* ... Your component code ... */ return <View></View>});

type Widget = { key: string; path: string; title: string; icon: (theme: any, color: string) => React.ReactNode; component: React.FC<any>; height: number; color?: string };

const WIDGETS_TEMPLATE: Widget[] = [
    { key: "client-dashboard-widget", path: "/clientdash", title: "Client Dashboard", icon: (theme, color) => <Ionicons name="people-outline" size={20} color={color} />, component: ClientDashboardWidget, height: 260 },
    { key: "workout-widget", path: "/workout", title: "Today's Workout", icon: (theme, color) => <Ionicons name="barbell-outline" size={20} color={color} />, component: WorkoutWidget, height: 220 },
    { key: "calendar-widget", path: "/calendar", title: "Calendar & To-Do", icon: (theme, color) => <Ionicons name="calendar-outline" size={20} color={color} />, component: CalendarWidget, height: 240 },
    // ... other widgets
];

const WidgetRenderer = ({ item, isLoading, styles }: any) => {
    const WidgetComponent = item.component;
    return isLoading ? <SkeletonLoader height={item.height} styles={styles} /> : <WidgetComponent styles={styles} />;
};

// --- MAIN COACH INDEX COMPONENT ---
export default function CoachIndexPage() {
  const { theme, setTheme } = useTheme();
  const { isLoading } = useWellaura();
  const { user } = useAuth();
  
  if (!theme || !user) {
    return null;
  }

  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [numColumns, setNumColumns] = useState(2);
  const [isEditMode, setEditMode] = useState(false);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [isThemeEditorVisible, setThemeEditorVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: 'widget' | 'theme', key: string } | null>(null);
  const [isSnapshotModalVisible, setSnapshotModalVisible] = useState(false);
  const [isAddWidgetModalVisible, setAddWidgetModalVisible] = useState(false);

  const styles = getDynamicStyles(theme);

  useEffect(() => {
    const loadLayout = async () => {
      try {
        const themeValue = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (themeValue) setTheme(JSON.parse(themeValue));
        
        const layoutValue = await AsyncStorage.getItem(LAYOUT_STORAGE_KEY);
        if (layoutValue) setNumColumns(JSON.parse(layoutValue));
        
        const widgetsValue = await AsyncStorage.getItem(WIDGETS_STORAGE_KEY);
        const savedWidgets = widgetsValue ? JSON.parse(widgetsValue) : null;
        if (Array.isArray(savedWidgets) && savedWidgets.length > 0) {
          const hydrated = savedWidgets.map((saved: any) => {
            const template = WIDGETS_TEMPLATE.find(w => w.key === saved.key);
            return template ? { ...template, ...saved } : null;
          }).filter(Boolean);
          setWidgets(hydrated as Widget[]);
        } else {
          setWidgets(WIDGETS_TEMPLATE);
        }
      } catch (e) { console.error("Failed to load coach layout.", e); setWidgets(WIDGETS_TEMPLATE); }
    };
    loadLayout();
  }, []);
  
  const saveTheme = async (newTheme: any) => { try { await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newTheme)); } catch (e) { console.error("Failed to save theme.", e); } };
  const saveWidgets = async (newWidgets: Widget[]) => { try { const simplified = newWidgets.map(({ component, icon, ...rest }) => rest); await AsyncStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(simplified)); setWidgets(newWidgets); } catch (e) { console.error("Failed to save coach widgets.", e); } };
  const updateWidgetProperty = (key: string, property: 'height' | 'color', value: any) => { const newWidgets = widgets.map(w => w.key === key ? { ...w, [property]: value } : w); saveWidgets(newWidgets); };
  const deleteWidget = (keyToDelete: string) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); const newWidgets = widgets.filter(w => w.key !== keyToDelete); saveWidgets(newWidgets); };
  const addWidget = (widgetToAdd: Widget) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); const newWidgets = [...widgets, widgetToAdd]; saveWidgets(newWidgets); setAddWidgetModalVisible(false); };
  const availableWidgets = useMemo(() => { const displayedWidgetKeys = new Set(widgets.map(w => w.key)); return WIDGETS_TEMPLATE.filter(w => !displayedWidgetKeys.has(w.key)); }, [widgets]);
  const handleSelectColorToEdit = (type: 'widget' | 'theme', key: string) => { setEditingItem({ type, key }); setThemeEditorVisible(false); setPickerVisible(true); };
  const handleCloseColorPicker = () => { setPickerVisible(false); setEditingItem(null); if (editingItem?.type === 'theme') { setThemeEditorVisible(true); } };
  const confirmColor = (newColor: string) => { if (editingItem) { if (editingItem.type === 'widget') { updateWidgetProperty(editingItem.key, 'color', newColor); } else if (editingItem.type === 'theme') { const newTheme = { ...theme, [editingItem.key]: newColor }; setTheme(newTheme); saveTheme(newTheme); } } handleCloseColorPicker(); };
  const handleSelectPresetTheme = (colors: any) => { setTheme(colors); saveTheme(colors); const newWidgets = widgets.map(w => ({ ...w, color: undefined })); saveWidgets(newWidgets); };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Widget>) => {
    const height = useSharedValue(item.height);
    const updateHeightInState = (newHeight: number) => { updateWidgetProperty(item.key, 'height', newHeight); };
    const panGestureHandler = useAnimatedGestureHandler({ onStart: (_, ctx: any) => { ctx.startHeight = height.value; }, onActive: (e, ctx: any) => { height.value = Math.max(120, ctx.startHeight + e.translationY); }, onEnd: () => { runOnJS(updateHeightInState)(height.value); }, });
    const animatedStyle = useAnimatedStyle(() => ({ height: height.value }));
    const itemSurfaceColor = item.color || theme.surface;
    const isItemSurfaceDark = tinycolor(itemSurfaceColor).isDark();
    const itemTextColor = isItemSurfaceDark ? theme.white : theme.textPrimary;
    const itemIcon = item.icon(theme, itemTextColor);
    return (
      <View style={[styles.widgetContainer, { width: numColumns === 1 ? "100%" : "50%" }]}>
        <TouchableOpacity onLongPress={isEditMode ? drag : undefined} disabled={!isEditMode} activeOpacity={0.8}>
          {isEditMode && (<TouchableOpacity style={styles.deleteButton} onPress={() => deleteWidget(item.key)}><Text style={styles.deleteButtonText}>×</Text></TouchableOpacity>)}
          <Animated.View style={[styles.card, { backgroundColor: itemSurfaceColor, opacity: isActive ? 0.8 : 1 }, animatedStyle]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>{itemIcon}<Text style={[styles.cardTitle, { color: itemTextColor }]}>{item.title}</Text></View>
              {isEditMode && (<TouchableOpacity style={[styles.editButton, {backgroundColor: tinycolor(itemTextColor).setAlpha(0.1).toRgbString()}]} onPress={() => handleSelectColorToEdit('widget', item.key)}><Feather name="edit-3" size={16} color={isItemSurfaceDark ? tinycolor(theme.white).setAlpha(0.7).toRgbString() : theme.textSecondary} /></TouchableOpacity>)}
            </View>
            <Link href={item.path as any} asChild disabled={isEditMode}>
              <TouchableOpacity style={styles.linkArea} activeOpacity={0.8}>
                <WidgetRenderer item={item} isLoading={isLoading} styles={styles} />
              </TouchableOpacity>
            </Link>
            {isEditMode && (<PanGestureHandler onGestureEvent={panGestureHandler}><Animated.View style={styles.resizeHandle}><Ionicons name="resize" size={16} color={isItemSurfaceDark ? tinycolor(theme.white).setAlpha(0.7).toRgbString() : theme.textSecondary} /></Animated.View></PanGestureHandler>)}
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.screen}>
      <DraggableFlatList
        key={numColumns}
        data={widgets}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        numColumns={numColumns}
        onDragEnd={({ data }) => saveWidgets(data)}
        dragEnabled={isEditMode}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={[styles.headerWelcome, { backgroundColor: theme.surface }]}>
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={styles.headerName}>Welcome back, {user.name}</Text>
                <Text style={styles.headerSubtitle}>Here's your coaching snapshot.</Text>
              </View>
              <View style={styles.headerActions}>
                {!isEditMode && (
                  <TouchableOpacity style={styles.todayButton} onPress={() => setSnapshotModalVisible(true)}>
                    <Ionicons name="sparkles-outline" size={22} color={tinycolor(theme.surface).isDark() ? theme.white : theme.primary} />
                  </TouchableOpacity>
                )}
                {isEditMode && (
                  <>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setAddWidgetModalVisible(true)}>
                      <Ionicons name="add" size={22} color={tinycolor(theme.surface).isDark() ? theme.white : theme.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setThemeEditorVisible(true)}>
                      <Ionicons name="color-palette-outline" size={22} color={tinycolor(theme.surface).isDark() ? theme.white : theme.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => { const newCols = numColumns === 1 ? 2 : 1; setNumColumns(newCols); AsyncStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(newCols)); }}>
                      <Ionicons name={numColumns === 1 ? "grid" : "list"} size={22} color={tinycolor(theme.surface).isDark() ? theme.white : theme.textPrimary} />
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity style={[styles.iconButton, isEditMode && {backgroundColor: theme.primary}]} onPress={() => setEditMode(!isEditMode)}>
                  <Feather name={isEditMode ? "check-square" : "edit-3"} size={22} color={isEditMode ? theme.white : (tinycolor(theme.surface).isDark() ? theme.white : theme.textPrimary)} />
                </TouchableOpacity>
              </View>
            </View>
            <WeatherWidget />
            <InsightsWidget theme={theme} styles={styles} />
          </View>
        }
        ListFooterComponent={<View style={{ height: 40 }} />}
      />
      <TodaySnapshotModal visible={isSnapshotModalVisible} onClose={() => setSnapshotModalVisible(false)} />
      <ColorPickerModal
        isVisible={isPickerVisible}
        onClose={handleCloseColorPicker}
        initialColor={editingItem?.type === 'widget' ? widgets.find(w => w.key === editingItem.key)?.color || theme.surface : theme[editingItem?.key || 'surface']}
        onColorConfirm={confirmColor}
        theme={theme}
      />
      <ThemeEditorModal
        isVisible={isThemeEditorVisible}
        onClose={() => setThemeEditorVisible(false)}
        theme={theme}
        onColorSelect={(key) => handleSelectColorToEdit('theme', key)}
        onSelectPreset={handleSelectPresetTheme}
        PRESET_THEMES={PRESET_THEMES}
      />
      <AddWidgetModal
        isVisible={isAddWidgetModalVisible}
        onClose={() => setAddWidgetModalVisible(false)}
        onAddWidget={addWidget}
        availableWidgets={availableWidgets}
        theme={theme}
      />
    </SafeAreaView>
  );
}