/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  loadSettings, 
  saveSettings, 
  loadLogs, 
  saveLogs, 
  loadHistory, 
  saveHistory, 
  loadStreak, 
  saveStreak, 
  checkDailyReset, 
  populateMockAnalyticsIfEmpty,
  getTodayDateString
} from './utils/db';
import { AppSettings, WaterLog, DailyHistory, ReminderNotification, OnboardingData } from './types';
import WaterBottle from './components/WaterBottle';
import Onboarding from './components/Onboarding';
import Analytics from './components/Analytics';
import NotificationSettings from './components/NotificationSettings';
import { 
  Plus, 
  Flame, 
  Calendar, 
  Timer, 
  Bell, 
  Settings as SettingsIcon, 
  Droplets, 
  Activity, 
  Battery, 
  Wifi, 
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { setupLocalNotifications } from './utils/notifications';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [history, setHistory] = useState<DailyHistory[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [todayLogged, setTodayLogged] = useState<number>(0);
  
  // Custom sound and simulated clock offsets
  const [targetSimulatedDate, setTargetSimulatedDate] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  // App Navigation Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'notifications' | 'settings'>('dashboard');

  // Interactive Container entry size input state
  const [customVolumeInput, setCustomVolumeInput] = useState<string>('50');

  // Celebration burst visual toggle state
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Load and check state factors
  useEffect(() => {
    // 1. Fill beautiful mock logs if first time loading, so graphs are populated
    populateMockAnalyticsIfEmpty();
    
    // 2. Fetch starter database state
    setLogs(loadLogs());
    setHistory(loadHistory());
    setStreak(loadStreak());

    // 3. Keep simulated local clock updating in status bar
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync state and run resetting triggers
  useEffect(() => {
    runResetCheck();
  }, [targetSimulatedDate]);

  useEffect(() => {
    // Schedule local notifications natively via capacitor
    setupLocalNotifications(settings);
  }, [settings]);

  useEffect(() => {
    const listenForActions = async () => {
      await LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        if (notificationAction.actionId === 'log_50') {
          handleLogIntake(50);
        } else if (notificationAction.actionId === 'tap') {
          // just opened the app, we could maybe open a specific tab
          setActiveTab('dashboard');
        }
      });
      
      await LocalNotifications.addListener('localNotificationReceived', () => {
        // Play the custom ringtone if the app is active
        try {
          if (settings.customSoundData) {
            const audio = new Audio(settings.customSoundData);
            audio.volume = 0.5;
            audio.play().catch(e => console.warn('Failed to play custom sound', e));
          }
        } catch (e) {
          console.warn('Failed to play local notification sound', e);
        }
      });
    };
    listenForActions();
    return () => {
      LocalNotifications.removeAllListeners();
    };
  }, [todayLogged, logs, history, streak, settings]); // Dependencies for handleLogIntake closure

  const runResetCheck = () => {
    const activeDate = targetSimulatedDate || undefined;
    const { resetOccurred, loggedAmount } = checkDailyReset(activeDate);
    
    // Refresh lists
    setLogs(loadLogs());
    setHistory(loadHistory());
    setStreak(loadStreak());
    setTodayLogged(loggedAmount);

    if (resetOccurred) {
      console.log('Midnight date rollover updated logs archives.');
    }
  };

  // Safe drink logger
  const handleLogIntake = (amount: number) => {
    if (amount <= 0) return;

    const todayStr = getTodayDateString(targetSimulatedDate || undefined);
    const newLog: WaterLog = {
      id: `log-${Date.now()}`,
      amount,
      timestamp: (targetSimulatedDate || new Date()).toISOString(),
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveLogs(updatedLogs);

    const oldTotal = todayLogged;
    const newTotal = todayLogged + amount;
    setTodayLogged(newTotal);

    // Is daily goal target crossed just now?
    if (oldTotal < settings.dailyTarget && newTotal >= settings.dailyTarget) {
      // Goal celebration trigger!
      triggerCelebration();

      // Update streaks immediately on top of database
      const updatedStreak = streak + 1;
      setStreak(updatedStreak);
      saveStreak(updatedStreak);

      // Log completion to today's history line
      const currentHistory = loadHistory();
      const existingTodayIndex = currentHistory.findIndex(h => h.date === todayStr);

      if (existingTodayIndex >= 0) {
        currentHistory[existingTodayIndex].total = newTotal;
        currentHistory[existingTodayIndex].completed = true;
      } else {
        currentHistory.push({
          date: todayStr,
          target: settings.dailyTarget,
          total: newTotal,
          completed: true
        });
      }
      setHistory(currentHistory);
      saveHistory(currentHistory);
    } else {
      // Normal logs save
      const currentHistory = loadHistory();
      const existingTodayIndex = currentHistory.findIndex(h => h.date === todayStr);

      if (existingTodayIndex >= 0) {
        currentHistory[existingTodayIndex].total = newTotal;
        currentHistory[existingTodayIndex].completed = newTotal >= settings.dailyTarget;
      } else {
        currentHistory.push({
          date: todayStr,
          target: settings.dailyTarget,
          total: newTotal,
          completed: newTotal >= settings.dailyTarget
        });
      }
      setHistory(currentHistory);
      saveHistory(currentHistory);
    }
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    // Auto timeout celebration splash
    setTimeout(() => {
      setShowCelebration(false);
    }, 4500);
  };

  // Quick Action Container Preset Lists
  const containerPresets = [
    { label: 'Glass', value: 250, desc: 'Average Tumbler font' },
    { label: 'Bottle', value: 500, desc: 'Gym Flask' },
    { label: 'Flask', value: 750, desc: 'Large Container' }
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(customVolumeInput, 10);
    if (!isNaN(amount) && amount > 0) {
      handleLogIntake(amount);
    }
  };

  // Config saves
  const handleCompleteOnboarding = (calculatedTarget: number, onboardingData: OnboardingData) => {
    const updatedSettings: AppSettings = {
      ...settings,
      dailyTarget: calculatedTarget,
      onboarding: onboardingData
    };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);

    // Refresh reset check to sync active goals
    setTimeout(() => {
      runResetCheck();
    }, 100);
  };

  const updateSettingsDirect = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // Auto recalculate today total/history offsets
    setTimeout(() => {
      runResetCheck();
    }, 100);
  };

  // Simulated Manual Midnight Tester
  const triggerSimulatedMidnight = () => {
    const tomorrow = targetSimulatedDate ? new Date(targetSimulatedDate) : new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Set simulated clock time to morning
    tomorrow.setHours(8, 0, 0);
    setTargetSimulatedDate(tomorrow);
    
    alert(`Simulation active! Fast-forwarded date to: ${tomorrow.toLocaleDateString()}`);
  };

  const handleResetOnboarding = () => {
    const resetSettings: AppSettings = {
      ...settings,
      onboarding: {
        weight: 70,
        weightUnit: 'kg',
        activityLevel: 'active',
        gender: 'female',
        completed: false
      }
    };
    setSettings(resetSettings);
    saveSettings(resetSettings);
    
    // Clear logs to give a true reset feel
    localStorage.removeItem('hydrotrack_logs');
    localStorage.removeItem('hydrotrack_history');
    localStorage.removeItem('hydrotrack_streak');
    localStorage.removeItem('hydrotrack_last_opened_date');
    
    setLogs([]);
    setHistory([]);
    setStreak(0);
    setTodayLogged(0);
  };

  const percentage = settings.dailyTarget > 0 ? Math.min((todayLogged / settings.dailyTarget) * 100, 100) : 0;

  return (
    <div className="w-full h-[100dvh] bg-slate-50 flex flex-col text-slate-800 bg-grid-pattern overflow-hidden relative">
      
      {/* Background radial gradients for ambient subtle light feel */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/40 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-100/30 rounded-full filter blur-3xl pointer-events-none" />

      {/* Simulated Water Splash/Droplet Confetti Animation when 100% target goal hit */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            {/* CSS Splash animations ripples */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <motion.div 
                className="absolute inset-0 bg-cyan-500/20 rounded-full border border-cyan-400/40"
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
              />
              <motion.div 
                className="absolute inset-4 bg-blue-500/10 rounded-full border border-blue-400/30"
                initial={{ scale: 0.5, opacity: 0.9 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.4, ease: 'easeOut' }}
              />
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-green-300">
                <Sparkles className="w-10 h-10 text-white animate-bounce" />
              </div>
            </div>

            <h3 className="text-xl font-black font-display text-green-400 mt-4">Goal Achieved! 🎉</h3>
            <p className="text-xs text-slate-300 mt-2 max-w-xs">
              Amazing job! You hit 100% of your daily water intake target. Keep the hydrated streak alive!
            </p>
            
            <button
              type="button"
              onClick={() => setShowCelebration(false)}
              className="mt-6 py-2 px-5 bg-green-500 hover:bg-green-400 text-slate-950 text-xs font-black rounded-xl cursor-pointer shadow-md transition-all scale-100 hover:scale-105 active:scale-95"
            >
              Keep Tracking
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Core Router Body Layout */}
      <div className="flex-1 overflow-hidden relative p-4 flex flex-col z-10">
        
        {/* Force screen blockage if onboarding is incomplete */}
        {!settings.onboarding.completed ? (
                <Onboarding onComplete={handleCompleteOnboarding} />
              ) : (
                <>
                  {/* APP TAB SCREEN CONTENT */}

                  {/* TAB 1: THE HOME DASHBOARD */}
                  {activeTab === 'dashboard' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col justify-between overflow-y-auto space-y-4"
                    >
                      {/* Top Metric Header Row */}
                      <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                          <span className="text-orange-500 text-xs">🔥</span>
                          <span className="font-bold text-orange-700 text-xs">{streak} Days</span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">Today's Goal</span>
                          <div className="text-xs text-slate-900 font-sans font-black">
                            <span className="text-blue-600">{todayLogged}</span>
                            <span className="text-slate-400 font-normal"> / {settings.dailyTarget}ml</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Visual Bottle component */}
                      <WaterBottle logged={todayLogged} target={settings.dailyTarget} />

                      {/* Control Panel: quick tap preset button list and editable input box */}
                      <div className="space-y-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                        
                        {/* 1. Quick Selector presets */}
                        <div className="flex gap-2 justify-between">
                          {containerPresets.map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => handleLogIntake(preset.value)}
                              className="flex-1 py-3 bg-slate-50 border border-slate-100/60 rounded-xl text-center transition-all hover:bg-white hover:border-slate-200 hover:shadow-sm hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                            >
                              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-tight mb-0.5">{preset.label}</span>
                              <span className="font-mono text-[11px] font-bold text-blue-600">+{preset.value}ml</span>
                            </button>
                          ))}
                        </div>

                        {/* 2. Custom Input Form Row */}
                        <form onSubmit={handleCustomSubmit} className="flex gap-2.5 items-center border-t border-slate-100 pt-3">
                          <div className="flex-1 relative">
                            <input
                              type="number"
                              id="water-intake-input"
                              placeholder="50"
                              value={customVolumeInput}
                              onChange={(e) => setCustomVolumeInput(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-blue-600 focus:bg-white pr-10"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono">
                              ml
                            </span>
                          </div>

                          <button
                            type="submit"
                            id="quick-log-btn"
                            className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 px-4 rounded-xl shadow-md shadow-blue-100 transition-all flex items-center justify-center text-xs font-bold gap-1 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" /> Log
                          </button>
                        </form>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: ANALYTICS GRAPHS */}
                  {activeTab === 'history' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 overflow-hidden"
                    >
                      <Analytics 
                        history={history} 
                        logs={logs} 
                        dailyTarget={settings.dailyTarget} 
                        streak={streak} 
                      />
                    </motion.div>
                  )}

                  {/* TAB 3: ALERTS SIMULATOR HOVER LIST */}
                  {activeTab === 'notifications' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 overflow-hidden"
                    >
                      <div className="h-full overflow-y-auto pb-10">
                        <NotificationManager
                          settings={settings}
                          onLogWater={handleLogIntake}
                          notifications={notifications}
                          setNotifications={setNotifications}
                          activeBanner={activeBanner}
                          setActiveBanner={setActiveBanner}
                          mode="tray"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: SETTINGS SYSTEM CONFIG */}
                  {activeTab === 'settings' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 overflow-hidden"
                    >
                      <NotificationSettings
                        settings={settings}
                        onSaveSettings={updateSettingsDirect}
                        resetOnboarding={handleResetOnboarding}
                        simulateMidnight={triggerSimulatedMidnight}
                      />
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* 4. Android Bottom Screen Interactive Navigation bar */}
            {settings.onboarding.completed && (
              <div className="h-16 border-t border-slate-200/60 bg-white flex justify-around items-center px-4 shrink-0 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)] relative z-20">
                <button
                  type="button"
                  id="tab-dashboard"
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-450 text-slate-400 hover:text-slate-600'}`}
                >
                  <Droplets className="w-5 h-5" />
                  <span className="text-[9px] font-bold mt-1">Intake</span>
                </button>

                <button
                  type="button"
                  id="tab-history"
                  onClick={() => setActiveTab('history')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-450 text-slate-400 hover:text-slate-600'}`}
                >
                  <Activity className="w-5 h-5" />
                  <span className="text-[9px] font-bold mt-1">Analytics</span>
                </button>

                <button
                  type="button"
                  id="tab-settings"
                  onClick={() => setActiveTab('settings')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-450 text-slate-400 hover:text-slate-600'}`}
                >
                  <SettingsIcon className="w-5 h-5" />
                  <span className="text-[9px] font-bold mt-1">Config</span>
                </button>
              </div>
            )}
    </div>
  );
}
