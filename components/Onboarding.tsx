import React, { useState } from 'react';
import { generateBusinessBlueprint } from '../services/geminiService';
import { BusinessBlueprint } from '../types';
import { Dumbbell, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: (blueprint: BusinessBlueprint) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    "Analyzing fitness niche...",
    "Designing high-ticket programs...",
    "Writing website copy...",
    "Generating 30-day content plan...",
    "Finalizing business blueprint..."
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsGenerating(true);
    
    // Simulate loading steps for UX
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const blueprint = await generateBusinessBlueprint(description);
      
      clearInterval(interval);
      if (blueprint) {
        onComplete(blueprint);
      }
    } catch (error) {
      console.error("Failed to generate", error);
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center">
          <div className="w-20 h-20 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
             <div className="absolute inset-0 bg-primary-500 rounded-full animate-ping opacity-20"></div>
            <Sparkles className="text-primary-500 animate-pulse" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Building Your Business</h2>
          <p className="text-slate-400 mb-10">AI is architecting your fitness empire...</p>
          
          <div className="space-y-4 text-left">
            {steps.map((step, index) => (
              <div key={index} className={`flex items-center gap-4 transition-all duration-500 ${index <= loadingStep ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-4'}`}>
                {index < loadingStep ? (
                  <CheckCircle2 className="text-green-500" size={24} />
                ) : index === loadingStep ? (
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-slate-600"></div>
                )}
                <span className={`text-base font-medium ${index <= loadingStep ? 'text-white' : 'text-slate-500'}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary-600/30 transform rotate-3">
            <Dumbbell className="text-white" size={40} />
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">FitnessOS</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">The operating system for modern fitness coaches.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
            Describe your ideal coaching business
          </label>
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full h-40 p-5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-slate-900 dark:text-white bg-white dark:bg-slate-950 mb-6 text-lg placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
              placeholder="e.g. I help busy corporate dads lose 20lbs in 90 days using kettlebells and intermittent fasting..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50 p-5 rounded-xl mb-8 text-sm text-primary-800 dark:text-primary-200">
              <span className="font-bold flex items-center gap-2 mb-1"><Sparkles size={16} /> AI Magic:</span> 
              We'll generate your website, pricing, and content plan instantly.
            </div>

            <button
              type="submit"
              disabled={!description.trim()}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20"
            >
              Build My Business <ArrowRight size={20} />
            </button>
          </form>
        </div>
        
        <p className="text-center text-slate-400 dark:text-slate-600 text-sm mt-8">Powered by Gemini 2.5 Flash • Secure Supabase Auth</p>
      </div>
    </div>
  );
};

export default Onboarding;