import React, { useState, useEffect } from 'react';
import { ReminderNotification, AppSettings } from '../types';
import { Bell, Check, Trash2, Volume2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationManagerProps {
  settings: AppSettings;
  onLogWater: (amount: number) => void;
  notifications: ReminderNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<ReminderNotification[]>>;
  activeBanner: ReminderNotification | null;
  setActiveBanner: (banner: ReminderNotification | null) => void;
  mode: 'banner' | 'tray';
}

export default function NotificationManager({
  settings,
  onLogWater,
  notifications,
  setNotifications,
  activeBanner,
  setActiveBanner,
  mode
}: NotificationManagerProps) {

  // Play notification ringtone chime
  const playRingtone = () => {
    try {
      if (settings.customSoundData) {
        const audio = new Audio(settings.customSoundData);
        audio.volume = 0.6;
        audio.play();
      } else {
        // Fallback tone: synthesise clean audio using Web Audio API safely
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (ctx) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.15); // A5
          
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        }
      }
    } catch (e) {
      console.warn('Audio playback not allowed or failed', e);
    }
  };

  // Function to programmatically trigger a mock reminder
  const triggerMockReminder = () => {
    const bodies = [
      "Hey! Time for a glass of water to keep your metabolism active! 💧",
      "Your body is asking for hydration. Let's finish your daily goal. 🚀",
      "Stay focused, stay hydrated! Tap quick log below.",
      "A glass of water now boosts your energy levels. Chug it up! ✨",
      "Water is the best fuel for your brain. Drink up!"
    ];
    
    const randomBody = bodies[Math.floor(Math.random() * bodies.length)];
    const quickLogAmounts = [250, 500, 350];
    const amount = quickLogAmounts[Math.floor(Math.random() * quickLogAmounts.length)];

    const newNotification: ReminderNotification = {
      id: `reminder-${Date.now()}`,
      title: "💧 HydroTrack Reminder",
      body: randomBody,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      actionAmount: amount
    };

    setNotifications(prev => [newNotification, ...prev]);
    setActiveBanner(newNotification);
    playRingtone();
  };

  const handleAction = (id: string, amount: number) => {
    onLogWater(amount);
    // Dismiss/close banner
    if (activeBanner?.id === id) {
      setActiveBanner(null);
    }
    // Mark as read/completed
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const dismissBanner = (id: string) => {
    if (activeBanner?.id === id) {
      setActiveBanner(null);
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setActiveBanner(null);
  };

  if (mode === 'banner') {
    return (
      <AnimatePresence>
        {activeBanner && (
          <motion.div
            initial={{ opacity: 0, y: -80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="absolute top-14 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl border border-blue-200 p-4 shadow-xl z-50 text-slate-800"
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-blue-600 animate-bounce" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{activeBanner.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{activeBanner.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {activeBanner.body}
                </p>

                {/* Direct Action Buttons Inside Notification */}
                <div className="flex items-center gap-2 mt-3.5">
                  <button
                    type="button"
                    onClick={() => handleAction(activeBanner.id, activeBanner.actionAmount || 250)}
                    className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Quick Drink +{activeBanner.actionAmount || 250}ml
                  </button>
                  <button
                    type="button"
                    onClick={() => dismissBanner(activeBanner.id)}
                    className="py-1.5 px-3 border border-slate-200 text-slate-500 hover:text-slate-800 text-[11px] font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="space-y-4 text-left">
      {/* Simulator Tools Section on Dashboard */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Smart Reminder Simulator</h3>
            <p className="text-[11px] text-slate-550 text-slate-500 leading-normal mt-0.5">
              Simulate high-fidelity Android local push alerts triggered by the background worker.
            </p>
          </div>
          <button
            type="button"
            onClick={triggerMockReminder}
            className="p-2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition-all text-xs font-bold shrink-0 hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
          >
            Trigger Alert
          </button>
        </div>

        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-blue-600" />
            Sound: <span className="text-slate-700 font-mono font-bold capitalize">{settings.customSoundName}</span>
          </span>
          <span>
            Hours: <span className="text-slate-700 font-mono font-bold">{settings.startHour} - {settings.endHour}</span>
          </span>
        </div>
      </div>

      {/* Notifications Inbox (Android System Tray History) */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-800">Android Notification Tray</h3>
          </div>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAllNotifications}
              className="text-[10px] text-rose-500 font-bold hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Clear Tray
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-550/5 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Bell className="w-8 h-8 text-slate-400 mb-2 stroke-[1.5]" />
            <span className="text-xs text-slate-500 font-medium">Your notification tray is empty.</span>
            <span className="text-[10px] text-slate-400 mt-1">Tap "Trigger Alert" above to test.</span>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-xl border transition-all text-xs flex gap-2.5 items-start ${notif.read ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm'}`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${notif.read ? 'bg-slate-400' : 'bg-blue-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-slate-700">{notif.title}</span>
                    <span className="text-[9px] text-slate-400 font-mono">{notif.timestamp}</span>
                  </div>
                  <p className="text-slate-500 leading-normal">{notif.body}</p>

                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => handleAction(notif.id, notif.actionAmount || 250)}
                      className="mt-2 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-600 py-1 px-2.5 rounded-l-lg rounded-xl font-bold border border-blue-100 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Quick Chug +{notif.actionAmount || 250}ml
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
