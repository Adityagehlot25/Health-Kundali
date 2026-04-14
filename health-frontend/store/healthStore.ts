import { create } from 'zustand';

interface HealthState {
  // --- HARDWARE DATA ---
  hardwareMetrics: { steps: string; sleep: string; hr: string; bp: string; spo2: string; temp: string; };
  masterPayload: any; 
  setHardwareData: (metrics: any, payload: any) => void;

  // --- SMART JOURNAL DATA ---
  manualData: {
    nutrition: { waterLiters: number; calories: number; proteinGrams: number; carbsGrams: number; fiberGrams: number; foodItems: string[] };
    gym: { completedToday: boolean; split: string; workoutLogs: string[] };
    cycle: { isMenstruating: boolean; symptoms: string };
    injuries: { active: boolean; location: string; notes: string };
  };
  setManualData: (updater: (prevData: any) => any) => void;

  // --- NEW: USER GOALS ---
  goals: {
    steps: string;
    waterLiters: string;
    calories: string;
  };
  setGoals: (newGoals: any) => void;

  // 🤖 AI PLAN STATE
  currentPlan: string | null;
  setPlan: (plan: string) => void;

  // 🔄 LOAD DATA FROM DB
  loadDailyData: (manualData: any, plan: string) => void;

  // --- AUTHENTICATION ---
  isAuthenticated: boolean;
  userToken: string | null;
  userData: { 
    id: string; name: string; email: string; 
    gender?: string; dob?: string; height?: string; weight?: string;
    goal?: string; activityLevel?: string; diet?: string; medicalInfo?: string;
  } | null;
  loginSession: (token: string, user: any) => void;
  logoutSession: () => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  hardwareMetrics: { steps: "0", sleep: "--", hr: "--", bp: "--/--", spo2: "--", temp: "--" },
  masterPayload: null,
  setHardwareData: (metrics, payload) => set({ hardwareMetrics: metrics, masterPayload: payload }),

  manualData: {
    nutrition: { waterLiters: 0, calories: 0, proteinGrams: 0, carbsGrams: 0, fiberGrams: 0, foodItems: [] },
    gym: { completedToday: false, split: "None", workoutLogs: [] },
    cycle: { isMenstruating: false, symptoms: "None" },
    injuries: { active: false, location: "None", notes: "None" }
  },
  setManualData: (updater) => set((state) => ({ manualData: updater(state.manualData) })),

  // The default baseline goals for a new user
  goals: {
    steps: "10000",
    waterLiters: "3",
    calories: "2500"
  },
  setGoals: (newGoals) => set((state) => ({ goals: { ...state.goals, ...newGoals } })),

  // 🤖 AI PLAN STATE
  currentPlan: null,
  setPlan: (plan) => set({ currentPlan: plan }),

  // 🔄 LOAD DATA FROM DB
  loadDailyData: (dbManualData, dbPlan) => set((state) => ({ 
    manualData: dbManualData || state.manualData,
    currentPlan: dbPlan || null 
  })),

  // --- AUTHENTICATION ---
  isAuthenticated: false,
  userToken: null,
  userData: null,
  loginSession: (token, user) => set({ isAuthenticated: true, userToken: token, userData: user }),
  logoutSession: () => set({ isAuthenticated: false, userToken: null, userData: null, masterPayload: null })
}));