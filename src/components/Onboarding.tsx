import React, { useState } from 'react';
import { OnboardingData, AppSettings } from '../types';
import { calculateWaterGoal } from '../utils/db';
import { Activity, Dumbbell, User, Info, Scale, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface OnboardingProps {
  onComplete: (calculatedTarget: number, onboardingData: OnboardingData) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [weight, setWeight] = useState<number>(70);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [activity, setActivity] = useState<'sedentary' | 'active' | 'highly_active'>('active');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');

  // Calculates target dynamically based on current values
  const currentCalculatedGoal = calculateWaterGoal(weight, unit, activity);

  const handleNext = () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as any);
    } else {
      const onboardingData: OnboardingData = {
        weight,
        weightUnit: unit,
        activityLevel: activity,
        gender,
        completed: true,
      };
      onComplete(currentCalculatedGoal, onboardingData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as any);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 rounded-3xl overflow-hidden shadow-xl relative border border-slate-200/80">
      {/* Top Banner Accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-600" />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="p-6 pt-8 flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2 border border-blue-100">
          <Activity className="w-6 h-6 text-blue-600 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold font-sans tracking-tight text-center text-slate-900">
          Personalize Hydration
        </h2>
        <p className="text-xs text-slate-500 mt-1">Let's calculate your daily hydration requirement</p>

        {/* Step dots */}
        <div className="flex gap-2 mt-4">
          <span className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200'}`} />
          <span className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200'}`} />
          <span className={`h-1.5 rounded-full transition-all duration-300 ${step === 3 ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200'}`} />
        </div>
      </div>

      {/* Form Content Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-2">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 mb-3">
                <Scale className="w-4 h-4 text-blue-600" /> Body Weight
              </label>
              
              {/* Unit Toggle pills */}
              <div className="bg-slate-100 p-1 rounded-xl flex max-w-xs mx-auto mb-5 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    if (unit !== 'kg') {
                      setUnit('kg');
                      setWeight(Math.round(weight / 2.20462));
                    }
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${unit === 'kg' ? 'bg-blue-600 text-white shadow-md font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Kilograms (kg)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (unit !== 'lbs') {
                      setUnit('lbs');
                      setWeight(Math.round(weight * 2.20462));
                    }
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${unit === 'lbs' ? 'bg-blue-600 text-white shadow-md font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Pounds (lbs)
                </button>
              </div>

              {/* Slider Input with big number display */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 text-center space-y-4 shadow-sm">
                <div className="text-5xl font-mono font-black text-blue-600">
                  {weight} <span className="text-xl font-sans text-slate-400 font-normal">{unit}</span>
                </div>
                <input
                  type="range"
                  min={unit === 'kg' ? 30 : 60}
                  max={unit === 'kg' ? 180 : 400}
                  step="1"
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-450 font-mono">
                  <span>{unit === 'kg' ? '30 kg' : '60 lbs'}</span>
                  <span>{unit === 'kg' ? '180 kg' : '400 lbs'}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 mb-3">
                <User className="w-4 h-4 text-blue-600" /> Biological Gender
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['female', 'male', 'other'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-3 px-2 rounded-xl text-xs font-semibold capitalize border transition-all ${gender === g ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-755'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 mb-2">
              <Dumbbell className="w-4 h-4 text-blue-600" /> Activity Level
            </label>

            <div className="space-y-3">
              {[
                {
                  id: 'sedentary',
                  title: 'Sedentary',
                  desc: 'Little to no exercise, desk job work style.',
                  offset: '+0 ml',
                },
                {
                  id: 'active',
                  title: 'Moderately Active',
                  desc: 'Light workout or active job (30-60 min run/gym).',
                  offset: '+500 ml',
                },
                {
                  id: 'highly_active',
                  title: 'Highly Active',
                  desc: 'Intense daily workouts, high physical labor or sports.',
                  offset: '+1000 ml',
                },
              ].map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setActivity(act.id as any)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${activity === act.id ? 'bg-blue-50/50 border-blue-500 shadow-sm text-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${activity === act.id ? 'border-blue-500' : 'border-slate-300'}`}>
                    {activity === act.id && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-bold ${activity === act.id ? 'text-blue-600' : ''}`}>{act.title}</span>
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100 font-semibold font-mono">{act.offset}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{act.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center space-y-6 py-4"
          >
            <div className="inline-flex p-3 rounded-full bg-green-50 border border-green-100 text-green-600 mb-2">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Your Recommended Intake</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Based on your weight of <b>{weight} {unit}</b> and active status, we computed your daily hydration target.
              </p>
            </div>

            {/* Target Card Visual */}
            <div className="bg-gradient-to-b from-blue-50/50 to-white border border-blue-100 rounded-3xl p-6 max-w-xs mx-auto shadow-sm relative overflow-hidden">
              {/* Decorative liquid wave absolute overlay inside goal */}
              <div className="absolute inset-x-0 bottom-0 top-[60%] bg-blue-500/5 -z-10 rounded-b-3xl blur-sm" />
              
              <div className="text-xs font-bold tracking-widest uppercase text-blue-650 text-blue-600">DAILY HYDRATION GOAL</div>
              <div className="text-5xl font-mono font-black mt-2 text-slate-900">
                {currentCalculatedGoal} <span className="text-lg font-sans font-normal text-slate-450">ml</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 font-mono">
                ≈ {(currentCalculatedGoal / 250).toFixed(1)} glasses of 250ml
              </div>
            </div>

            <div className="flex items-center gap-2 justify-center text-[10px] text-slate-400 text-center max-w-xs mx-auto">
              <Info className="w-3.5 h-3.5 text-blue-450 text-blue-500/70 shrink-0" />
              <span>You can adjust this daily target manually in the app settings at any time.</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="p-6 bg-white border-t border-slate-200/80 flex justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="py-3 px-5 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 transition-all flex1"
          >
            Back
          </button>
        ) : (
          <div className="flex-1" /> // spacer
        )}

        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-3 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          {step === 3 ? 'Set Goal & Start' : 'Next Step'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
