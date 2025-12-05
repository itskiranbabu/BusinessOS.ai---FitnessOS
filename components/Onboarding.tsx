import React, { useState } from 'react';
import { generateBusinessBlueprint } from '../services/geminiService';
import { BusinessBlueprint } from '../types';
import { Dumbbell, Sparkles, ArrowRight, CheckCircle2, Cpu, BrainCircuit, Rocket } from 'lucide-react';

interface OnboardingProps {
  onComplete: (blueprint: BusinessBlueprint) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    { text: "Analyzing market trends & competitor data...", icon: BrainCircuit },
    { text: "Architecting high-ticket program structure...", icon: Dumbbell },
    { text: "Drafting persuasive sales copy...", icon: Sparkles },
    { text: "Designing viral content strategy...", icon: Rocket },
    { text: "Finalizing your Business Blueprint...", icon: Cpu }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsGenerating(true);
    
    // Simulate thinking time for each step to build anticipation
    const stepDuration = 1800; // 1.8s per step
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, stepDuration);

    try {
      const blueprint = await generateBusinessBlueprint(description);
      
      clearInterval(interval);
      // Wait for the final step animation
      setTimeout(() => {
        if (blueprint) {
            onComplete(blueprint);
        }
      }, 1000);
      
    } catch (error) {
      console.error("Failed to generate", error);
      setIsGenerating(false);
      clearInterval(interval);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/20 rounded-full blur-[120px] animate-blob"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-md w-full relative z-10 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-primary-500/40 relative">
             <div className="absolute inset-0 bg-primary-400 rounded-full animate-ping opacity-20"></div>
             <Sparkles className="text-white animate-pulse-slow" size={48} />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Building Your Empire</h2>
          <p className="text-slate-400 mb-12">AI is architecting your fitness business...</p>
          
          <div className="space-y-6 text-left bg-slate-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-md">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === loadingStep;
              const isCompleted = index < loadingStep;
              
              return (
                <div key={index} className={`flex items-center gap-4 transition-all duration-500 ${index <= loadingStep ? 'opacity-100 translate-x-0' : 'opacity-20 translate-x-2'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500 ${
                    isCompleted ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                    isActive ? 'bg-primary-500/20 border-primary-500 text-primary-400' :
                    'border-slate-700 text-slate-700'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={16} /> : isActive ? <Icon size={16} className="animate-pulse" /> : <Icon size={16} />}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>
                    {step.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 text-white relative">
       {/* Background */}
       <div className="absolute inset-0 bg-mesh opacity-40 z-0"></div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/10 mb-8 backdrop-blur-sm shadow-xl">
             <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Dumbbell className="text-white" size={24} />
             </div>
             <span className="ml-4 text-2xl font-bold tracking-tight">FitnessOS</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Launch your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-300">Dream Business</span> in seconds.
          </h1>
          <p className="text-xl text-slate-400 max-w-lg mx-auto leading-relaxed">
            The AI operating system used by elite fitness coaches to build, launch, and scale.
          </p>
        </div>

        <div className="bg-slate-900/60 p-1 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="bg-[#0B1121] rounded-[20px] p-8 md:p-10">
                <label className="block text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={14} className="text-primary-400" /> What's your vision?
                </label>
                <form onSubmit={handleSubmit}>
                    <textarea
                    className="w-full h-40 p-5 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-white bg-slate-950/50 text-lg placeholder:text-slate-600 shadow-inner transition-all mb-6"
                    placeholder="e.g. I help busy corporate dads lose 20lbs in 90 days using kettlebells and intermittent fasting..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    />
                    
                    <button
                    type="submit"
                    disabled={!description.trim()}
                    className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white py-5 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary-600/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        Generate Business Blueprint <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
        
        <div className="flex justify-center gap-6 mt-10 text-slate-500 text-sm font-medium">
            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> No Credit Card Required</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Powered by Gemini AI</span>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;