import React, { useEffect, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ColorPicker from "react-native-wheel-color-picker";
import tinycolor from "tinycolor2";

const pastelColors = ['#FFFFFF', '#fde4cf', '#fbf8cc', '#d9f9cc', '#cce6ff', '#d9cce6', '#fccfcf', '#cfd8dc'];

export const ColorPickerModal = ({ isVisible, onClose, initialColor, onColorConfirm, theme }) => {
    if (!theme) return null;
    const styles = getDynamicStyles(theme);
    const [tempColor, setTempColor] = useState(initialColor);
    const [hexInput, setHexInput] = useState(tinycolor(initialColor).toHexString());

    useEffect(() => {
        setTempColor(initialColor);
        setHexInput(tinycolor(initialColor).toHexString());
    }, [initialColor, isVisible]);

    const handleColorChange = (color) => {
        setTempColor(color);
        setHexInput(tinycolor(color).toHexString());
    };

    const applyHexCode = () => {
        const color = tinycolor(hexInput);
        if (color.isValid()) {
            setTempColor(color.toHexString());
        } else {
            Alert.alert("Invalid Color", "Please enter a valid HEX color code.");
        }
    };

    return (
        <Modal visible={isVisible} onRequestClose={onClose} transparent animationType="fade">
            <View style={styles.modalBackdrop}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Choose a Color</Text>
                    <View style={styles.pickerWrapper}>
                        <ColorPicker color={tempColor} onColorChangeComplete={handleColorChange} thumbSize={30} sliderSize={20} noSnap={true} row={false} />
                    </View>
                    <Text style={styles.swatchLabel}>Swatches</Text>
                    <View style={styles.swatchContainer}>
                        {pastelColors.map(color => (
                            <TouchableOpacity key={color} style={[styles.swatch, { backgroundColor: color, borderColor: tinycolor.equals(tempColor, color) ? theme.primary : theme.border }]} onPress={() => handleColorChange(color)} />
                        ))}
                    </View>
                    <View style={styles.hexInputContainer}>
                        <TextInput style={styles.hexInput} value={hexInput} onChangeText={setHexInput} placeholder="#FFFFFF" autoCapitalize="none" />
                        <TouchableOpacity style={styles.applyButton} onPress={applyHexCode}>
                            <Text style={styles.applyButtonText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.confirmButton} onPress={() => onColorConfirm(tempColor)}>
                        <Text style={styles.confirmButtonText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const getDynamicStyles = (theme) => StyleSheet.create({
    modalBackdrop: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContainer: { width: "90%", maxHeight: '80%', backgroundColor: theme.surface, borderRadius: 24, padding: 24, alignItems: "center" },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 20 },
    pickerWrapper: { height: 250, width: '100%', marginBottom: 20 },
    swatchLabel: { fontSize: 16, fontWeight: '600', color: theme.textSecondary, alignSelf: 'flex-start', marginBottom: 10 },
    swatchContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
    swatch: { width: 36, height: 36, borderRadius: 18, margin: 4, borderWidth: 3 },
    hexInputContainer: { flexDirection: 'row', alignItems: 'center', width: '100%' },
    hexInput: { flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 10, height: 44, color: theme.textPrimary, fontSize: 16, fontWeight: '500' },
    applyButton: { marginLeft: 10, backgroundColor: theme.border, paddingHorizontal: 15, height: 44, justifyContent: 'center', borderRadius: 12 },
    applyButtonText: { fontWeight: 'bold', color: theme.textPrimary },
    confirmButton: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 40, backgroundColor: theme.primary, borderRadius: 20 },
    confirmButtonText: { color: tinycolor(theme.primary).isDark() ? theme.white : theme.textPrimary, fontSize: 16, fontWeight: 'bold' },
});