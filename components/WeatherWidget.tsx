import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../app/context/ThemeContext'; // Adjust path if needed

// Interface for the weather data structure
interface WeatherData {
  temperature: number;
  weatherCode: number;
  locationName: string;
}

// Helper to get weather icon and description from WMO weather codes
const getWeatherInfo = (code: number) => {
  const weatherMap = {
    0: { icon: 'sunny-outline', description: 'Clear sky' },
    1: { icon: 'partly-sunny-outline', description: 'Mainly clear' },
    2: { icon: 'partly-sunny-outline', description: 'Partly cloudy' },
    3: { icon: 'cloud-outline', description: 'Overcast' },
    45: { icon: 'reorder-two-outline', description: 'Fog' },
    48: { icon: 'reorder-two-outline', description: 'Depositing rime fog' },
    51: { icon: 'rainy-outline', description: 'Light drizzle' },
    53: { icon: 'rainy-outline', description: 'Moderate drizzle' },
    55: { icon: 'rainy-outline', description: 'Dense drizzle' },
    61: { icon: 'rainy-outline', description: 'Slight rain' },
    63: { icon: 'rainy-outline', description: 'Moderate rain' },
    65: { icon: 'thunderstorm-outline', description: 'Heavy rain' },
    80: { icon: 'rainy-outline', description: 'Slight rain showers' },
    81: { icon: 'rainy-outline', description: 'Moderate rain showers' },
    82: { icon: 'thunderstorm-outline', description: 'Violent rain showers' },
    95: { icon: 'thunderstorm-outline', description: 'Thunderstorm' },
  };
  return weatherMap[code] || { icon: 'cloud-outline', description: 'Cloudy' };
};

export const WeatherWidget = () => {
  const { theme } = useTheme();
  const styles = getDynamicStyles(theme);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // 1. Request permission to access the user's location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // 2. Get the user's current location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 3. Geocode the location to get a city name
      let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      const locationName = geocode[0]?.city || 'Current Location';

      // 4. Fetch weather data from the API
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        const data = await response.json();
        
        if (data && data.current_weather) {
          setWeather({
            temperature: Math.round(data.current_weather.temperature),
            weatherCode: data.current_weather.weathercode,
            locationName: locationName,
          });
        }
      } catch (error) {
        setErrorMsg('Could not fetch weather data');
        console.error(error);
      }
    })();
  }, []); // Empty array ensures this runs only once on component mount

  // --- Render Logic ---
  const renderContent = () => {
    if (errorMsg) {
      return <Text style={styles.text}>{errorMsg}</Text>;
    }

    if (!weather) {
      return <ActivityIndicator size="small" color={theme.primary} />;
    }

    const { icon, description } = getWeatherInfo(weather.weatherCode);

    return (
      <View style={styles.contentContainer}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={styles.text.color} />
          <Text style={styles.locationText}>{weather.locationName}</Text>
        </View>
        <View style={styles.weatherContainer}>
          <Text style={styles.tempText}>{weather.temperature}°C</Text>
          <Ionicons name={icon as any} size={32} color={styles.text.color} style={{ marginLeft: 16 }}/>
        </View>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>
    );
  };

  return <View style={styles.widgetContainer}>{renderContent()}</View>;
};

const getDynamicStyles = (theme: any) =>
  StyleSheet.create({
    widgetContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginTop: 16,
      backgroundColor: theme.surface,
      borderRadius: 20,
      borderWidth: theme.surface === theme.background ? 1 : 0,
      borderColor: theme.border,
    },
    contentContainer: {
      alignItems: 'center',
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
    },
    locationText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 4,
    },
    weatherContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 8,
    },
    tempText: {
      color: theme.textPrimary,
      fontSize: 48,
      fontWeight: 'bold',
    },
    descriptionText: {
        color: theme.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    text: {
        color: theme.textPrimary,
        fontSize: 16,
    }
  });