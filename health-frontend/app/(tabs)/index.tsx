import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics'; // Adding that premium haptic feel!

import PlanetCard from '../../components/ui/PlanetCard';
import { fetchMasterBiologicalData } from '../../services/HealthConnectService';
import { useHealthStore } from '../../store/healthStore';

export default function DashboardScreen() {
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  // Connect to the Global Brain
  const { hardwareMetrics, manualData, setHardwareData, masterPayload } = useHealthStore();

  const pullHealthData = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      setLoading(true);
      const data = await fetchMasterBiologicalData();
      
      const todayAtMidnight = new Date();
      todayAtMidnight.setHours(0, 0, 0, 0);

      // Extract Data safely
      const stepRecords = data.biometrics.activity?.steps?.records || [];
      const todaysStepsRecords = stepRecords.filter((record: any) => new Date(record.endTime) >= todayAtMidnight);
      const sourceTotals: { [key: string]: number } = {};
      todaysStepsRecords.forEach((record: any) => {
        const source = record.metadata?.recordingMethod || 'unknown';
        sourceTotals[source] = (sourceTotals[source] || 0) + record.count;
      });
      const steps = Math.max(...Object.values(sourceTotals), 0).toString();

      const hrRecords = (data.biometrics.vitals?.heartRate?.records || []) as any[];
      const hr = hrRecords.length > 0 ? (hrRecords[hrRecords.length - 1]?.samples?.[hrRecords[hrRecords.length - 1]?.samples?.length - 1]?.beatsPerMinute || hrRecords[hrRecords.length - 1]?.value)?.toString() || "--" : "--";

      const sleepRecords = (data.biometrics.sleep?.records || []) as any[];
      const sleep = sleepRecords.length > 0 ? (((new Date((sleepRecords[sleepRecords.length - 1] as any)?.endTime).getTime()) - (new Date((sleepRecords[sleepRecords.length - 1] as any)?.startTime).getTime())) / (1000 * 60 * 60)).toFixed(1) : "--";

      const bpRecords = (data.biometrics.vitals?.bloodPressure?.records || []) as any[];
      const latestBP = bpRecords.length > 0 ? bpRecords[bpRecords.length - 1] : null;
      const bp = latestBP ? `${Math.round((latestBP as any)?.systolic?.inMillimetersOfMercury || (latestBP as any)?.systolic || 0)}/${Math.round((latestBP as any)?.diastolic?.inMillimetersOfMercury || (latestBP as any)?.diastolic || 0)}` : "--/--";

      const spo2Records = (data.biometrics.vitals?.oxygenSaturation?.records || []) as any[];
      const spo2 = spo2Records.length > 0 ? ((spo2Records[spo2Records.length - 1] as any)?.percentage || (spo2Records[spo2Records.length - 1] as any)?.value)?.toString() || "--" : "--";

      const tempRecords = (data.biometrics.vitals?.bodyTemperature?.records || []) as any[];
      const latestTemp = tempRecords.length > 0 ? tempRecords[tempRecords.length - 1] : null;
      const temp = latestTemp ? ((latestTemp as any)?.temperature?.inCelsius || (latestTemp as any)?.value)?.toFixed(1) || "--" : "--";

      // SAVE TO GLOBAL STORE
      setHardwareData({ steps, hr, sleep, bp, spo2, temp }, data);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to read Health Connect data.");
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setLoading(true);
    setPlan("");
    try {
      const fullAIContext = { manualInputs: manualData, hardwareData: masterPayload };
      const response = await fetch('http://192.168.236.232:3000/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullAIContext),
      });

      if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
      const data = await response.json();
      if (data.success) {
        setPlan(data.plan);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error(error);
      setPlan("Network Error: Make sure your server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Health Kundali</Text>
          <Text style={styles.subtitle}>Your 9-Planet Ecosystem</Text>
        </View>

        <View style={styles.grid}>
          {/* We now read from hardwareMetrics instead of local state */}
          <PlanetCard title="Steps" value={hardwareMetrics.steps} iconName="footsteps" status={Number(hardwareMetrics.steps) > 8000 ? "optimal" : "normal"} />
          <PlanetCard title="Activity" value={manualData.gym.split !== "None" ? "Yes" : "Rest"} iconName="fitness" status="normal" />
          <PlanetCard title="Fatigue" value="--" unit="/100" iconName="battery-half" status="warning" />

          <PlanetCard title="Heart" value={hardwareMetrics.hr} unit="bpm" iconName="heart-circle" status="normal" />
          <PlanetCard title="BP" value={hardwareMetrics.bp} iconName="water" status="normal" />
          <PlanetCard title="Water" value={manualData.nutrition.waterLiters} unit="L" iconName="beer" status={manualData.nutrition.waterLiters >= 2 ? "optimal" : "warning"} />

          <PlanetCard title="SpO2" value={hardwareMetrics.spo2} unit="%" iconName="pulse" status="normal" />
          <PlanetCard title="Sleep" value={hardwareMetrics.sleep} unit="hr" iconName="moon" status="normal" />
          <PlanetCard title="Diet" value={manualData.nutrition.calories} unit="kcal" iconName="restaurant" status="normal" />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.syncButton} onPress={pullHealthData} disabled={loading}>
            <Ionicons name="sync" size={20} color="#fff" />
            <Text style={styles.syncButtonText}> Sync Hardware</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.generateButton} onPress={generatePlan} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateButtonText}>✨ Generate Plan</Text>}
          </TouchableOpacity>
        </View>

        {plan ? (
          <View style={styles.planCard}>
            <Text style={styles.planHeader}>✨ Your Daily Kundli Plan</Text>
            <Markdown style={markdownStyles}>{plan}</Markdown>
          </View>
        ) : (
          <Text style={styles.placeholderText}>Awaiting Kundali generation...</Text>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ... Keep your exact same styles and markdownStyles here!
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  scrollContainer: { flexGrow: 1, padding: 16, paddingBottom: 60 },
  header: { marginBottom: 24, marginTop: 20 },
  title: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  subtitle: { fontSize: 16, color: '#94A3B8', marginTop: 4, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  syncButton: { flex: 1, backgroundColor: '#334155', padding: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginRight: 8 },
  syncButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  generateButton: { flex: 1, backgroundColor: '#3B82F6', padding: 14, borderRadius: 12, alignItems: 'center', marginLeft: 8 },
  generateButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  planCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#334155' },
  planHeader: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15, textAlign: 'center' },
  placeholderText: { textAlign: 'center', color: '#64748B', marginTop: 20, fontSize: 16, fontStyle: 'italic' },
});

const markdownStyles = StyleSheet.create({
  body: { fontSize: 16, lineHeight: 26, color: '#E2E8F0' },
  heading2: { fontSize: 20, fontWeight: 'bold', color: '#60A5FA', marginTop: 20, marginBottom: 10 },
  heading3: { fontSize: 18, fontWeight: 'bold', color: '#93C5FD', marginTop: 15, marginBottom: 5 },
  bullet_list: { marginTop: 10, marginBottom: 10 },
  strong: { fontWeight: 'bold', color: '#FFFFFF' },
  em: { fontStyle: 'italic', color: '#CBD5E1' }
});