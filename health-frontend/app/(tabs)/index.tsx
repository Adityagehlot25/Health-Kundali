import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Markdown from 'react-native-markdown-display';
import { useHealthStore } from '../../store/healthStore';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  
  // Pull everything we need from the Global Brain
  const { userData, manualData, hardwareMetrics, currentPlan, setPlan } = useHealthStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = async () => {
    if (!userData?.id) {
      Alert.alert("Error", "You must be logged in to generate a plan.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsGenerating(true);

    try {
      const response = await fetch('http://192.168.236.232:3000/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userData.id, 
          manualInputs: manualData, 
          hardwareData: hardwareMetrics 
        })
      });

      const data = await response.json();

      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPlan(data.plan); // Save the Markdown to the Global Brain!
      } else {
        Alert.alert("Generation Failed", data.error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Could not connect to the AI engine.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {userData?.name?.split(' ')[0] || 'Explorer'}</Text>
          <Text style={styles.subtitle}>Your Daily Action Center</Text>
        </View>

        {/* GENERATE BUTTON */}
        <TouchableOpacity 
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]} 
          onPress={handleGeneratePlan}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="sparkles" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.generateButtonText}>Generate Today's Plan</Text>
            </>
          )}
        </TouchableOpacity>

        {/* AI PLAN VIEWER */}
        <View style={styles.planCard}>
          {currentPlan ? (
            <Markdown style={markdownStyles}>
              {currentPlan}
            </Markdown>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#334155" />
              <Text style={styles.emptyStateText}>No plan generated yet.</Text>
              <Text style={styles.emptyStateSubtext}>Tap the button above to let the AI analyze your Kundali.</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// UI STYLES
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { padding: 20 },
  header: { marginBottom: 24, marginTop: 10 },
  greeting: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 16, color: '#94A3B8', marginTop: 4 },
  
  generateButton: { backgroundColor: '#3B82F6', paddingVertical: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  generateButtonDisabled: { backgroundColor: '#475569', shadowOpacity: 0 },
  generateButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },

  planCard: { backgroundColor: '#1E293B', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155', minHeight: 300 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyStateText: { color: '#E2E8F0', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  emptyStateSubtext: { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
});

// MARKDOWN STYLES (Overrides the default black text for Dark Mode)
const markdownStyles = StyleSheet.create({
  body: { color: '#E2E8F0', fontSize: 16, lineHeight: 24 },
  heading2: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  heading3: { color: '#3B82F6', fontSize: 18, fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  strong: { color: '#3B82F6', fontWeight: 'bold' },
  bullet_list: { marginTop: 8, marginBottom: 16 },
  list_item: { marginBottom: 8 },
  paragraph: { marginBottom: 12 },
});