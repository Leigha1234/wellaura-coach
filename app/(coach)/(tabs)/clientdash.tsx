import { Link } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import tinycolor from 'tinycolor2';
import { useTheme } from '../../context/ThemeContext';

// --- TYPESCRIPT INTERFACES ---
interface Client {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  status: 'Active' | 'Inactive';
  lastCheckIn: string;
  programFocus: string;
}

// --- DUMMY DATA ---
const dummyClients: Client[] = [
  {
    id: '1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=25',
    status: 'Active',
    lastCheckIn: 'Checked in yesterday',
    programFocus: 'Hypertrophy',
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john.smith@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=60',
    status: 'Active',
    lastCheckIn: 'Checked in 3 days ago',
    programFocus: 'Strength Training',
  },
  {
    id: '3',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=32',
    status: 'Inactive',
    lastCheckIn: 'Last check-in 1 month ago',
    programFocus: 'Fat Loss',
  },
  {
    id: '4',
    name: 'Michael Brown',
    email: 'm.brown@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    status: 'Active',
    lastCheckIn: 'Checked in today',
    programFocus: 'Marathon Prep',
  },
    {
    id: '5',
    name: 'Emily White',
    email: 'emily.white@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=45',
    status: 'Active',
    lastCheckIn: 'Checked in this morning',
    programFocus: 'General Fitness',
  },
];

// --- DYNAMIC STYLES ---
const getDynamicStyles = (theme: any) => {
    const isSurfaceDark = tinycolor(theme.surface).isDark();
    const cardTextColor = isSurfaceDark ? theme.white : theme.textPrimary;
    const cardSecondaryTextColor = isSurfaceDark ? tinycolor(theme.white).setAlpha(0.7).toRgbString() : theme.textSecondary;

    return StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: theme.background,
      },
      container: {
        paddingHorizontal: 16,
        paddingVertical: 24,
      },
      header: {
        marginBottom: 24,
      },
      headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.textPrimary,
      },
      headerSubtitle: {
        fontSize: 16,
        color: theme.textSecondary,
        marginTop: 4,
      },
      card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#9FB1C4",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: theme.surface === theme.background ? 1 : 0,
        borderColor: theme.border,
      },
      avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
      },
      clientInfo: {
        flex: 1,
      },
      clientName: {
        fontSize: 18,
        fontWeight: '600',
        color: cardTextColor,
      },
      programFocus: {
        fontSize: 14,
        color: cardSecondaryTextColor,
        marginTop: 2,
      },
      lastCheckIn: {
        fontSize: 12,
        color: cardSecondaryTextColor,
        marginTop: 4,
        fontStyle: 'italic',
        opacity: 0.8,
      },
      statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginLeft: 16,
      },
      statusActive: {
        backgroundColor: '#38A169', // Green
      },
      statusInactive: {
        backgroundColor: '#CBD5E0', // Gray
      },
    });
};

// --- SUB-COMPONENT FOR A SINGLE CLIENT CARD ---
const ClientCard: React.FC<{ client: Client; styles: any }> = ({ client, styles }) => (
  <View style={styles.card}>
    <Image source={{ uri: client.avatarUrl }} style={styles.avatar} />
    <View style={styles.clientInfo}>
      <Text style={styles.clientName}>{client.name}</Text>
      <Text style={styles.programFocus}>{client.programFocus}</Text>
      <Text style={styles.lastCheckIn}>{client.lastCheckIn}</Text>
    </View>
    <View style={[styles.statusIndicator, client.status === 'Active' ? styles.statusActive : styles.statusInactive]} />
  </View>
);


// --- MAIN DASHBOARD COMPONENT ---
const ClientDash: React.FC = () => {
  const { theme } = useTheme();
  const activeClientsCount = dummyClients.filter(c => c.status === 'Active').length;

  if (!theme) {
    return null;
  }
  
  const styles = getDynamicStyles(theme);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Client Management</Text>
            <Text style={styles.headerSubtitle}>{activeClientsCount} of {dummyClients.length} clients are active</Text>
        </View>
        
        {dummyClients.map((client) => (
          <Link key={client.id} href={`/client/${client.id}`} asChild>
            <TouchableOpacity>
              <ClientCard client={client} styles={styles} />
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClientDash;