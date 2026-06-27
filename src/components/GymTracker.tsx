import React, { useState, useEffect } from 'react';
import { GymWorkout, AppSettings, GymSettings } from '../types';
import { loadGymWorkouts, saveGymWorkouts, getTodayDateString } from '../utils/db';
import { Dumbbell, Plus, Trash2, Calendar, Clock, Save, Trash } from 'lucide-react';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  targetSimulatedDate: Date | null;
}

export default function GymTracker({ settings, targetSimulatedDate }: Props) {
  const [workouts, setWorkouts] = useState<GymWorkout[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newWorkout, setNewWorkout] = useState<Partial<GymWorkout>>({
    type: 'Strength',
    duration: 60,
    intensity: 'medium',
    notes: ''
  });
  
  useEffect(() => {
    // Gym should reset by default on Sunday
    // Only load workouts from the current week (Sunday onwards)
    const allWorkouts = loadGymWorkouts();
    const currentDate = targetSimulatedDate || new Date();
    
    // Find the most recent Sunday
    const recentSunday = new Date(currentDate);
    recentSunday.setHours(0, 0, 0, 0);
    recentSunday.setDate(recentSunday.getDate() - recentSunday.getDay()); // 0 is Sunday
    
    const currentWeekWorkouts = allWorkouts.filter(w => {
      const wDate = new Date(w.date);
      wDate.setHours(0, 0, 0, 0);
      return wDate.getTime() >= recentSunday.getTime();
    });
    
    setWorkouts(currentWeekWorkouts);
  }, [targetSimulatedDate]);

  const handleSaveWorkout = () => {
    if (!newWorkout.type || !newWorkout.duration) return;
    
    const w: GymWorkout = {
      id: `gym-${Date.now()}`,
      date: getTodayDateString(targetSimulatedDate || undefined),
      duration: newWorkout.duration,
      type: newWorkout.type,
      intensity: newWorkout.intensity as 'low' | 'medium' | 'high',
      notes: newWorkout.notes || ''
    };
    
    const updated = [w, ...workouts];
    setWorkouts(updated);
    
    // We should save all workouts, but to implement the "reset on Sunday" cleanly 
    // at a data level, we can just save the updated current week list back to storage,
    // which effectively archives/deletes older weeks. 
    // Or we keep everything and filter on load. We'll just append it to all workouts in DB.
    const allWorkouts = loadGymWorkouts();
    const updatedAll = [w, ...allWorkouts];
    saveGymWorkouts(updatedAll);
    
    setShowAdd(false);
    setNewWorkout({ type: 'Strength', duration: 60, intensity: 'medium', notes: '' });
  };
  
  const handleDeleteWorkout = (id: string) => {
    const updated = workouts.filter(w => w.id !== id);
    setWorkouts(updated);
    
    const allWorkouts = loadGymWorkouts();
    const updatedAll = allWorkouts.filter(w => w.id !== id);
    saveGymWorkouts(updatedAll);
  };
  
  const getStreak = () => {
    if (workouts.length === 0) return 0;
    
    // Sort workouts by date descending
    const sortedDates = Array.from(new Set(workouts.map(w => w.date))).sort().reverse();
    if (sortedDates.length === 0) return 0;
    
    let streak = 0;
    const today = getTodayDateString(targetSimulatedDate || undefined);
    
    // Check if streak includes today or yesterday
    let checkDate = new Date(today);
    
    if (sortedDates[0] === today) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (sortedDates[0] === getTodayDateString(new Date(checkDate.setDate(checkDate.getDate() - 1)))) {
      streak = 1;
      checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - 2);
    } else {
      return 0; // No workout today or yesterday
    }
    
    for (let i = 1; i < sortedDates.length; i++) {
      if (sortedDates[i] === getTodayDateString(checkDate)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  return (
    <div className="h-full flex flex-col p-2 space-y-4 overflow-y-auto pb-20">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800">Gym Tracker</h2>
          <p className="text-xs text-slate-400">Current Streak: <span className="text-orange-500 font-bold">{getStreak()} Days</span></p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>
      
      {showAdd && (
        <div className="bg-white p-4 rounded-3xl border border-blue-100 shadow-sm animate-in zoom-in-95 fade-in">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-blue-500" />
            Log Workout
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 font-bold mb-1">Workout Type</label>
              <select 
                value={newWorkout.type} 
                onChange={e => setNewWorkout({...newWorkout, type: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
              >
                <option value="Strength">Strength / Weightlifting</option>
                <option value="Cardio">Cardio</option>
                <option value="HIIT">HIIT</option>
                <option value="Yoga">Yoga / Flexibility</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 font-bold mb-1">Duration (min)</label>
                <input 
                  type="number" 
                  value={newWorkout.duration} 
                  onChange={e => setNewWorkout({...newWorkout, duration: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-slate-500 font-bold mb-1">Intensity</label>
                <select 
                  value={newWorkout.intensity} 
                  onChange={e => setNewWorkout({...newWorkout, intensity: e.target.value as any})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-slate-500 font-bold mb-1">Notes</label>
              <input 
                type="text" 
                placeholder="e.g. Chest and Triceps"
                value={newWorkout.notes} 
                onChange={e => setNewWorkout({...newWorkout, notes: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
              />
            </div>
            
            <button 
              onClick={handleSaveWorkout}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md mt-2"
            >
              Save Workout
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 px-2 uppercase tracking-wider">This Week's Activity</h3>
        
        {workouts.length === 0 ? (
          <div className="bg-white/50 border border-slate-200 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400">
            <Dumbbell className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm font-bold">No workouts logged yet</p>
            <p className="text-xs">Tap the + button to log your first workout!</p>
          </div>
        ) : (
          workouts.map(workout => (
            <div key={workout.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  workout.intensity === 'high' ? 'bg-red-100 text-red-500' :
                  workout.intensity === 'medium' ? 'bg-orange-100 text-orange-500' :
                  'bg-green-100 text-green-500'
                }`}>
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{workout.type}</h4>
                  <div className="flex gap-2 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {workout.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {workout.duration}m</span>
                  </div>
                  {workout.notes && <p className="text-xs text-slate-500 mt-1">{workout.notes}</p>}
                </div>
              </div>
              <button 
                onClick={() => handleDeleteWorkout(workout.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
