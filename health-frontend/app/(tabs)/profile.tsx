import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useHealthStore } from '../../store/healthStore';
import * as SecureStore from 'expo-secure-store';

export default function ProfileScreen() {
  const { logoutSession, userData } = useHealthStore();

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    // 1. Delete the token from hardware memory
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    
    // 2. Wipe the Global Brain (Gatekeeper will auto-redirect!)
    logoutSession();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* USER HEADER */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color="#3B82F6" />
            </View>
            <View>
              <Text style={styles.name}>{userData?.name || "Explorer"}</Text>
              <Text style={styles.subtitle}>{userData?.goal || "Kundali"} Plan Active</Text>
            </View>
          </View>

          {/* 🧬 BIOLOGICAL PROFILE CARD */}
          <Text style={styles.sectionTitle}>BIOLOGICAL PROFILE</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowText}>Height</Text>
              <Text style={styles.dataText}>{userData?.height || "--"} cm</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowText}>Weight</Text>
              <Text style={styles.dataText}>{userData?.weight || "--"} kg</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowText}>Diet</Text>
              <Text style={styles.dataText}>{userData?.diet || "Any"}</Text>
            </View>
            <View style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Text style={styles.rowText}>Medical / Allergies</Text>
              <Text style={[styles.dataText, { maxWidth: '60%', textAlign: 'right' }]}>
                {userData?.medicalInfo || "None"}
              </Text>
            </View>
          </View>

          {/* DANGER ZONE: LOGOUT */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, marginTop: 10 },
  avatarContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 2, borderColor: '#334155' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 14, color: '#3B82F6', fontWeight: '600', marginTop: 4 },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8, marginLeft: 4, letterSpacing: 1 },
  
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
  rowText: { fontSize: 16, color: '#E2E8F0', fontWeight: '500' },
  dataText: { fontSize: 16, color: '#3B82F6', fontWeight: '600' },

  logoutButton: { backgroundColor: '#EF4444', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});