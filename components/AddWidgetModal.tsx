import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import tinycolor from 'tinycolor2';

export const AddWidgetModal = ({ isVisible, onClose, onAddWidget, availableWidgets, theme }) => {
    if (!theme) return null;
    const styles = getDynamicStyles(theme);

    return (
        <Modal visible={isVisible} onRequestClose={onClose} transparent animationType="fade">
            <View style={styles.modalBackdrop}>
                <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add a Widget</Text>
                    <ScrollView style={{ width: '100%' }}>
                        {availableWidgets.map((widget) => {
                            const icon = widget.icon(theme, theme.textPrimary);
                            return (
                                <TouchableOpacity key={widget.key} style={styles.addWidgetItem} onPress={() => onAddWidget(widget)}>
                                    {icon}
                                    <Text style={styles.addWidgetItemText}>{widget.title}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                    <TouchableOpacity style={[styles.confirmButton, { backgroundColor: theme.primary }]} onPress={onClose}>
                        <Text style={[styles.confirmButtonText, { color: tinycolor(theme.primary).isDark() ? theme.white : theme.textPrimary }]}>Done</Text>
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
    addWidgetItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.border, padding: 15, borderRadius: 15, marginBottom: 10 },
    addWidgetItemText: { fontSize: 18, fontWeight: '500', marginLeft: 15, color: theme.textPrimary },
    confirmButton: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 40, backgroundColor: theme.primary, borderRadius: 20 },
    confirmButtonText: { fontSize: 16, fontWeight: 'bold' },
});