import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '../app/context/ThemeContext'; // Adjust this path if needed

const ClientProgressChart = () => {
  const { theme } = useTheme();

  // Mock data to simulate a client's weekly workout consistency.
  // In a real app, you would fetch this data.
  const mockProgressData = [
    { value: 60, label: 'Mon' },
    { value: 75, label: 'Tue', dataPointText: '75' },
    { value: 80, label: 'Wed' },
    { value: 50, label: 'Thu' },
    { value: 90, label: 'Fri', dataPointText: '90' },
    { value: 85, label: 'Sat' },
    { value: 100, label: 'Sun' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Weekly Consistency
      </Text>
      <LineChart
        data={mockProgressData}
        color={theme.primary}
        thickness={3}
        yAxisLabelSuffix="%"
        yAxisTextStyle={{ color: theme.textSecondary }}
        xAxisLabelTextStyle={{ color: theme.textSecondary }}
        // Add data points for specific values
        dataPointsColor={theme.primary}
        textShiftY={-10}
        textFontSize={13}
        textColor={theme.textPrimary}
        // Styling for the pop-up pointer on touch
        pointerConfig={{
          pointerStripHeight: 160,
          pointerStripColor: theme.border,
          pointerStripWidth: 2,
          pointerColor: theme.border,
          radius: 6,
          pointerLabelWidth: 100,
          pointerLabelHeight: 90,
          pointerLabelComponent: items => {
            return (
              <View style={[styles.pointerContainer, { backgroundColor: theme.background }]}>
                <Text style={[styles.pointerLabel, { color: theme.textPrimary }]}>{items[0].value}%</Text>
              </View>
            );
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // This styling was moved from the parent page to make the component self-contained
    marginBottom: 20, 
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10, // Adjusted padding for better fit
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    marginLeft: 10, // Align with chart's starting point
  },
  pointerContainer: {
    height: 40,
    width: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  pointerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ClientProgressChart;