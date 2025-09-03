// lib/data.ts
export interface Client {
  id: string;
  name: string;
  avatarUrl: string;
  status: 'Active' | 'Inactive';
  lastCheckIn: string;
  email: string;
  goals: string[];
  notes: { date: string; text: string }[];
}

export const dummyClients: Client[] = [
  { id: '1', name: 'Jane Doe', avatarUrl: 'https://i.pravatar.cc/150?img=25', status: 'Active', lastCheckIn: '2024-08-14T10:00:00Z', email: 'jane.doe@example.com', goals: ['Improve sleep quality', 'Run a 5k in under 30 minutes', 'Incorporate more plant-based meals'], notes: [{ date: '2024-08-10', text: 'Discussed initial goals and sleep patterns. Jane is motivated and ready to start.' }, { date: '2024-08-01', text: 'Onboarding session completed.' }] },
  { id: '2', name: 'John Smith', avatarUrl: 'https://i.pravatar.cc/150?img=60', status: 'Active', lastCheckIn: '2024-08-12T14:30:00Z', email: 'john.smith@example.com', goals: ['Increase daily step count to 10,000', 'Reduce caffeine intake'], notes: [{ date: '2024-08-05', text: 'Follow-up on step count progress. John is finding it challenging in the afternoons.' }] },
  { id: '3', name: 'Michael Brown', avatarUrl: 'https://i.pravatar.cc/150?img=12', status: 'Active', lastCheckIn: '2024-08-15T09:00:00Z', email: 'michael.brown@example.com', goals: ['Build a consistent morning routine', 'Learn mindfulness techniques'], notes: [{ date: '2024-08-15', text: 'Productive session on mindfulness. Michael enjoyed the breathing exercises.' }] },
  { id: '4', name: 'Alice Johnson', avatarUrl: 'https://i.pravatar.cc/150?img=32', status: 'Inactive', lastCheckIn: '2024-07-10T11:00:00Z', email: 'alice.j@example.com', goals: ['Complete coaching program'], notes: [{ date: '2024-07-10', text: 'Final session. Alice achieved her primary goals. Program complete.' }] },
];