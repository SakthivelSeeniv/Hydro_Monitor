import React from 'react';
import { DailyHistory, WaterLog } from '../types';
import { AreaChart, TrendingUp, Calendar, Trophy, Zap, GlassWater, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsProps {
  history: DailyHistory[];
  logs: WaterLog[];
  dailyTarget: number;
  streak: number;
}

export default function Analytics({ history, logs, dailyTarget, streak }: AnalyticsProps) {
  
  // To ensure statistics are beautifully formatted, we sort history by date ascending
  // and take the last 7 entries (Weekly)
  const sortedHistory = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const last7Days = sortedHistory.slice(-7);

  // If we have less than 7 days, let's padding it with empty placeholders for visual beauty
  const filledDays = [...last7Days];
  while (filledDays.length < 7) {
    const d = new Date();
    d.setDate(d.getDate() - (7 - filledDays.length));
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    filledDays.unshift({
      date: dateStr,
      target: dailyTarget,
      total: 0,
      completed: false
    });
  }

  // Calculate stats values
  const totalCompletedDays = history.filter(h => h.completed).length;
  const achievementRate = history.length > 0
    ? Math.round((totalCompletedDays / history.length) * 100)
    : 0;

  const validTotalDaysAmount = history.reduce((sum, h) => sum + h.total, 0);
  const averageIntake = history.length > 0
    ? Math.round(validTotalDaysAmount / history.length)
    : 0;

  const maxIntake = history.length > 0
    ? Math.max(...history.map(h => h.total))
    : 0;

  // Render weekday letters (M, T, W...)
  const getWeekdayLetter = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString([], { weekday: 'short' }).charAt(0);
    } catch {
      return '';
    }
  };

  // Convert date format (e.g., 2026-06-22 to "06/22")
  const getFormattedDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      return `${parts[1]}/${parts[2]}`;
    } catch {
      return '';
    }
  };

  // SVG Bar Chart Dimensions
  const chartHeight = 120;
  const maxLoggedAmount = Math.max(...filledDays.map(d => d.total), dailyTarget, 2000);

  return (
    <div className="space-y-5 h-full overflow-y-auto pb-8 pr-1">
      {/* KPI Stats Bento Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        
        {/* Metric Card 1 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg Daily Intake</span>
            <div className="p-1 px-1.5 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
              <GlassWater className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-mono font-black text-slate-900">{averageIntake || 0} <span className="text-xs font-sans text-slate-450 font-normal">ml</span></div>
            <p className="text-[10px] text-slate-400 mt-1 leading-none font-medium">Over your logged logs</p>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Goal Completion</span>
            <div className="p-1 px-1.5 bg-green-50 rounded-lg text-green-600 border border-green-100">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-mono font-black text-slate-900">{achievementRate}%</div>
            <p className="text-[10px] text-slate-400 mt-1 leading-none font-medium">Daily goals success</p>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Streak Count</span>
            <div className="p-1 px-1.5 bg-orange-50 rounded-lg text-orange-600 border border-orange-100">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-mono font-black text-slate-900">{streak} <span className="text-xs font-sans text-slate-450 font-normal">days</span></div>
            <p className="text-[10px] text-slate-400 mt-1 leading-none font-medium">Consecutive hits</p>
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Personal Record</span>
            <div className="p-1 px-1.5 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-mono font-black text-slate-900">{maxIntake} <span className="text-xs font-sans text-slate-450 font-normal">ml</span></div>
            <p className="text-[10px] text-slate-400 mt-1 leading-none font-medium">Peak consumption in 1 day</p>
          </div>
        </div>

      </div>

      {/* Visual SVG Bar Chart for 7 Days */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <AreaChart className="w-4 h-4 text-blue-600" /> Weekly Consumption (7 Days)
        </h3>

        {/* Chart Container */}
        <div className="relative">
          {/* Chart Bars */}
          <div className="flex justify-between items-end h-32 px-1 relative">
            
            {/* Horizontal Gridline at target limit */}
            <div className="absolute left-0 right-0 h-px bg-blue-500/10 border-dashed border-t pointer-events-none z-10" style={{
              bottom: `${(dailyTarget / maxLoggedAmount) * 100}%`
            }}>
              <span className="absolute -top-3.5 right-0 text-[8px] font-sans font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 shadow-sm">Target {dailyTarget} ml</span>
            </div>

            {filledDays.map((day, idx) => {
              const heightPct = (day.total / maxLoggedAmount) * 100;
              const completed = day.total >= day.target;

              return (
                <div key={day.date} className="flex flex-col items-center group relative w-8">
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 bg-slate-900 text-[10px] text-white py-1 px-2 rounded-lg font-mono text-center shadow-lg pointer-events-none min-w-[70px]">
                    <p className="font-bold">{day.total} ml</p>
                    <p className="text-[8px] text-slate-400">{getFormattedDate(day.date)}</p>
                  </div>

                  {/* Vertical interactive Bar */}
                  <div className="w-5 bg-slate-50 rounded-t-lg h-24 flex items-end overflow-hidden border border-slate-100">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ delay: idx * 0.05, duration: 0.6 }}
                      className={`w-full rounded-t-sm ${completed ? 'bg-gradient-to-t from-green-500 to-green-400' : 'bg-gradient-to-t from-blue-500 to-blue-400'}`}
                    />
                  </div>

                  {/* Date label */}
                  <span className="text-[10px] font-bold text-slate-500 mt-2 font-mono">
                    {getWeekdayLetter(day.date)}
                  </span>
                  <span className="text-[8px] font-semibold text-slate-450 font-mono scale-90">
                    {getFormattedDate(day.date).split('/')[1]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hourly Drink Timings History */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3.5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-blue-600" /> Today's Log Timelines
        </h3>

        {logs.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
            <span className="text-[11px] text-slate-400">No logs stored yet for today. Let's record.</span>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 pl-4 ml-1.5 space-y-4">
            {logs.slice().reverse().map((log, index) => {
              const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={log.id} className="relative text-xs">
                  {/* Timeline bullet dot */}
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-sans font-bold text-slate-700">Logged {log.amount} ml</span>
                    <span className="text-[10px] text-slate-450 font-medium">{time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
