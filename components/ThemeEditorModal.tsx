import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import tinycolor from 'tinycolor2';

export const ThemeEditorModal = ({ isVisible, onClose, theme, onColorSelect, onSelectPreset, PRESET_THEMES }) => {
    if (!theme) return null;
    const styles = getDynamicStyles(theme);

    const themeOptions = [
        { key: 'background', label: 'Page Background' },
        { key: 'surface', label: 'Widget Background' },
        { key: 'textPrimary', label: 'Primary Text' },
        { key: 'primary', label: 'Accent Color' },
    ];

    return (
        <Modal visible={isVisible} onRequestClose={onClose} transparent animationType="fade">
            <View style={styles.modalBackdrop}>
                <View style={[styles.modalContainer, {backgroundColor: theme.surface}]}>
                    <Text style={[styles.modalTitle, {color: tinycolor(theme.surface).isDark() ? theme.white : theme.textPrimary}]}>Edit Theme</Text>
                    <ScrollView style={{width: '100%'}}>
                        <Text style={[styles.swatchLabel, {color: tinycolor(theme.surface).isDark() ? tinycolor(theme.white).setAlpha(0.7).toRgbString() : theme.textSecondary}]}>Preset Themes</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetThemeScrollView}>
                            {PRESET_THEMES.map(preset => (
                                <TouchableOpacity key={preset.name} onPress={() => onSelectPreset(preset.colors)}>
                                    <View style={[styles.presetThemeCard, { backgroundColor: preset.colors.surface, borderColor: preset.colors.primary }]}>
                                        <Text style={[styles.presetThemeName, { color: tinycolor(preset.colors.surface).isDark() ? preset.colors.white : preset.colors.textPrimary }]}>{preset.name}</Text>
                                        <View style={styles.presetThemeColors}>
                                            <View style={[styles.presetThemeSwatch, { backgroundColor: preset.colors.primary, borderColor: preset.colors.surface }]} />
                                            <View style={[styles.presetThemeSwatch, { backgroundColor: preset.colors.accent, borderColor: preset.colors.surface }]} />
                                            <View style={[styles.presetThemeSwatch, { backgroundColor: preset.colors.background, borderColor: preset.colors.surface }]} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <Text style={[styles.swatchLabel, {color: tinycolor(theme.surface).isDark() ? tinycolor(theme.white).setAlpha(0.7).toRgbString() : theme.textSecondary}]}>Custom Colors</Text>
                        {themeOptions.map(option => (
                            <TouchableOpacity key={option.key} style={styles.themeEditorRow} onPress={() => onColorSelect(option.key)}>
                                <Text style={[styles.themeEditorLabel, {color: tinycolor(theme.surface).isDark() ? theme.white : theme.textPrimary}]}>{option.label}</Text>
                                <View style={[styles.themeEditorSwatch, { backgroundColor: theme[option.key] }]} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity style={[styles.confirmButton, {backgroundColor: theme.primary}]} onPress={onClose}>
                        <Text style={[styles.confirmButtonText, {color: tinycolor(theme.primary).isDark() ? theme.white : theme.textPrimary}]}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const getDynamicStyles = (theme) => StyleSheet.create({
    modalBackdrop: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContainer: { width: "90%", maxHeight: '80%', borderRadius: 24, padding: 24, alignItems: "center" },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    swatchLabel: { fontSize: 16, fontWeight: '600', color: theme.textSecondary, alignSelf: 'flex-start', marginBottom: 10 },
    themeEditorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
    themeEditorLabel: { fontSize: 18 },
    themeEditorSwatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: theme.border },
    presetThemeScrollView: { paddingBottom: 10, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
    presetThemeCard: { width: 120, height: 120, borderRadius: 16, marginRight: 12, padding: 12, borderWidth: 3 },
    presetThemeName: { fontWeight: 'bold', fontSize: 14 },
    presetThemeColors: { flexDirection: 'row', marginTop: 'auto' },
    presetThemeSwatch: { width: 20, height: 20, borderRadius: 10, marginRight: -8, borderWidth: 2 },
    confirmButton: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 40, backgroundColor: theme.primary, borderRadius: 20 },
    confirmButtonText: { fontSize: 16, fontWeight: 'bold' },
});