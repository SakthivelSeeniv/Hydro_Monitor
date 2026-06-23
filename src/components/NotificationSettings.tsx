import React, { useRef, useState } from 'react';
import { AppSettings, OnboardingData } from '../types';
import { Settings, Volume2, Bell, Save, ArrowRight, Target, Clock, Music } from 'lucide-react';

interface NotificationSettingsProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  resetOnboarding: () => void;
  simulateMidnight: () => void;
}

export default function NotificationSettings({
  settings,
  onSaveSettings,
  resetOnboarding,
  simulateMidnight
}: NotificationSettingsProps) {
  const [target, setTarget] = useState<number>(settings.dailyTarget);
  const [frequency, setFrequency] = useState<number>(settings.reminderFrequency);
  const [startHour, setStartHour] = useState<string>(settings.startHour);
  const [endHour, setEndHour] = useState<string>(settings.endHour);
  const [maxNotifs, setMaxNotifs] = useState<number>(settings.maxNotificationsPerDay);
  const [soundName, setSoundName] = useState<string>(settings.customSoundName);
  const [soundData, setSoundData] = useState<string | null>(settings.customSoundData);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sound File Upload Handler: Convert to base64 so it stores fully offline in localStorage
  const handleSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File is too large! Please choose an audio under 2MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        setSoundName(file.name);
        setSoundData(base64Data);
        
        // Play audio directly as test
        try {
          const audio = new Audio(base64Data);
          audio.volume = 0.5;
          audio.play();
        } catch (e) {
          console.warn('Playback error', e);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updated: AppSettings = {
      ...settings,
      dailyTarget: target,
      reminderFrequency: frequency,
      startHour,
      endHour,
      maxNotificationsPerDay: maxNotifs,
      customSoundName: soundName,
      customSoundData: soundData,
    };
    onSaveSettings(updated);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 2500);
  };

  const soundPresets = [
    { name: 'Water Splash', tone: 'bubbles' },
    { name: 'Distant Chime', tone: 'chime' },
    { name: 'Modern Blip', tone: 'blip' }
  ];

  const handlePlayPresetSound = (presetName: string) => {
    setSoundName(presetName);
    setSoundData(null); // clears base64 so it defaults to core synthesis
    
    // Play sound sample
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (presetName === 'Water Splash') {
          // Bubbles
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        } else if (presetName === 'Distant Chime') {
          // High chime
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        } else {
          // Blip
          osc.type = 'square';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.setValueAtTime(220, ctx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        }
        
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch(e) {
      console.warn('Failed sound preset', e);
    }
  };

  return (
    <div className="space-y-5 h-full overflow-y-auto pb-10 pr-1">
      {/* Toast Notification for Saved feedback */}
      {showSavedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-1.5 z-50 animate-bounce">
          <Save className="w-4 h-4 shrink-0" />
          Settings Saved Offline
        </div>
      )}

      {/* Target Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" /> Daily Target Plan
        </h3>
        <div>
          <label className="block text-xs text-slate-500 mb-1.5 font-medium">Daily Target Consumption (ml)</label>
          <div className="flex gap-4">
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Math.max(100, parseInt(e.target.value, 10) || 0))}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Reminders Timer Settings */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" /> Reminder Algorithm
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-medium">Frequency (Mins)</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
            >
              <option value="2">Every 2 Mins</option>
              <option value="15">Every 15 Mins</option>
              <option value="30">Every 30 Mins</option>
              <option value="45">Every 45 Mins</option>
              <option value="60">Every 60 Mins (1h)</option>
              <option value="90">Every 90 Mins (1.5h)</option>
              <option value="120">Every 120 Mins (2h)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-medium">Daily Limit alerts</label>
            <input
              type="number"
              value={maxNotifs}
              onChange={(e) => setMaxNotifs(Math.max(1, parseInt(e.target.value, 10) || 0))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-medium">Active From</label>
            <input
              type="time"
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-medium">Active Until</label>
            <input
              type="time"
              value={endHour}
              onChange={(e) => setEndHour(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Ringtone Custom Picker */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Music className="w-4 h-4 text-blue-600" /> Alert Ringtone Config
        </h3>

        {/* Ringtone Presets */}
        <div>
          <label className="block text-xs text-slate-500 mb-2 font-medium">System Sound Presets</label>
          <div className="flex gap-2">
            {soundPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handlePlayPresetSound(preset.name)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${soundName === preset.name ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'}`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* File Custom Picker */}
        <div className="border-t border-slate-100 pt-4">
          <label className="block text-xs text-slate-500 mb-2 font-medium">Select Custom Tone from Storage</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-4 bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer flex-1 text-center"
            >
              Upload Ringtone (.mp3, .wav)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleSoundUpload}
              accept="audio/*"
              className="hidden"
            />
          </div>
          <div className="mt-2.5 bg-slate-50 p-2.5 rounded-xl flex items-center gap-2 text-[10px] text-slate-500 border border-slate-200">
            <Volume2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">Active ringtone: <b className="text-slate-800">{soundName}</b></span>
          </div>
        </div>
      </div>

      {/* Developer Tool: Test automatic midnight reset */}
      <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl space-y-3 shadow-sm">
        <h4 className="text-xs font-bold text-rose-700">Advanced Simulator Lab</h4>
        <p className="text-[10px] text-rose-600 leading-normal">
          Simulate a calendar midnight transition instantly in your sandbox to test daily log resets, logs archiving, and Streak calculation.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={simulateMidnight}
            className="flex-1 py-2 px-3 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Simulate Midnight Reset
          </button>
          <button
            type="button"
            onClick={resetOnboarding}
            className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-[11px] font-bold rounded-xl transition-all cursor-pointer text-slate-500 shadow-sm"
          >
            Reset Onboarding
          </button>
        </div>
      </div>

      {/* Form Submit Save Settings */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
      >
        <Save className="w-4 h-4" /> Save Setting Profiles
      </button>
    </div>
  );
}
