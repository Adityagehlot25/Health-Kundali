import React, { createContext, useContext, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface HealthData {
  steps: number;
  stepsGoal: number;
  calories: number;
  caloriesGoal: number;
  distance: number;
  distanceGoal: number;
  sleep: number;
  sleepGoal: number;
  heartRate: number;
  weight: number;
  height: number;
  age: number;
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  goal: string;
  level: string;
}

interface HealthContextValue {
  healthData: HealthData;
  userProfile: UserProfile;
  updateHealthData: (data: Partial<HealthData>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  logEntry: (data: Partial<HealthData>) => void;
  weeklySteps: number[];
  weeklySleep: number[];
  weeklyCalories: number[];
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
}

const defaultHealth: HealthData = {
  steps: 7842,
  stepsGoal: 10000,
  calories: 1640,
  caloriesGoal: 2200,
  distance: 5.2,
  distanceGoal: 8,
  sleep: 6.5,
  sleepGoal: 8,
  heartRate: 72,
  weight: 72,
  height: 175,
  age: 28,
};

const defaultProfile: UserProfile = {
  name: "Aditya",
  age: 28,
  weight: 72,
  height: 175,
  goal: "Lose Weight",
  level: "Intermediate",
};

const HealthContext = createContext<HealthContextValue | null>(null);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [healthData, setHealthData] = useState<HealthData>(defaultHealth);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const weeklySteps = [6200, 8100, 7500, 9200, 7842, 4300, 8900];
  const weeklySleep = [7.2, 6.5, 8.0, 7.8, 6.5, 9.0, 7.2];
  const weeklyCalories = [1800, 2100, 1650, 2300, 1640, 1900, 2050];

  const updateHealthData = (data: Partial<HealthData>) => {
    setHealthData((prev) => ({ ...prev, ...data }));
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profile }));
  };

  const logEntry = (data: Partial<HealthData>) => {
    setHealthData((prev) => ({
      ...prev,
      steps: data.steps !== undefined ? prev.steps + data.steps : prev.steps,
      calories: data.calories !== undefined ? prev.calories + data.calories : prev.calories,
      sleep: data.sleep !== undefined ? data.sleep : prev.sleep,
      heartRate: data.heartRate !== undefined ? data.heartRate : prev.heartRate,
    }));
  };

  return (
    <HealthContext.Provider
      value={{
        healthData,
        userProfile,
        updateHealthData,
        updateProfile,
        logEntry,
        weeklySteps,
        weeklySleep,
        weeklyCalories,
        isOnboarded,
        setIsOnboarded,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error("useHealth must be used within HealthProvider");
  return ctx;
}
