import React, { useState } from 'react';
import { generateBusinessBlueprint } from '../services/geminiService';
import { BusinessBlueprint } from '../types';
import { Dumbbell, Sparkles, ArrowRight, CheckCircle2, Cpu, BrainCircuit, Rocket, Target, Globe } from 'lucide-react';

interface OnboardingProps {
  onComplete: (blueprint: BusinessBlueprint) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    { text: "INJECTING NEURAL AGENTS...", icon: BrainCircuit },
    { text: "ANALYZING COMPETITOR WEAKNESSES...", icon: Target },
    { text: "ARCHITECTING HIGH-CONVERSION FUNNEL...", icon: Globe },
    { text: "GENERATING PSYCHOLOGICAL COPY...", icon: Sparkles },
    { text: "DEPLOYING BUSINESS BLUEPRINT...", icon: Cpu }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsGenerating(true);
    
    // Simulate thinking time for each step to build anticipation
    const stepDuration = 2000; 
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, stepDuration);

    try {
      const blueprint = await generateBusinessBlueprint(description);
      
      clearInterval(interval);
      setLoadingStep(steps.length); // All done
      
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
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-mono">
        {/* Ambient Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 bg-grid-pattern opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-600 to-cyan-400 animate-scanline"></div>

        <div className="max-w-md w-full relative z-10 text-center">
          <div className="w-24 h-24 bg-slate-900 border-2 border-primary-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(99,102,241,0.4)] relative">
             <div className="absolute inset-0 border border-cyan-400 rounded-full animate-ping opacity-20"></div>
             <Cpu className="text-primary-400 animate-pulse-slow" size={48} />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight uppercase">Constructing System</h2>
          <div className="w-full bg-slate-800 h-1 mt-4 mb-8 rounded-full overflow-hidden">
             <div className="h-full bg-cyan-400 transition-all duration-300 ease-out" style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}></div>
          </div>
          
          <div className="space-y-4 text-left">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === loadingStep;
              const isCompleted = index < loadingStep;
              
              return (
                <div key={index} className={`flex items-center gap-4 transition-all duration-500 ${index <= loadingStep ? 'opacity-100 translate-x-0' : 'opacity-10 translate-x-4'}`}>
                  <span className={`text-xs font-bold ${isActive ? 'text-cyan-400' : isCompleted ? 'text-green-500' : 'text-slate-700'}`}>
                      {isCompleted ? '[OK]' : isActive ? '[RUN]' : '[WAIT]'}
                  </span>
                  <span className={`text-xs tracking-wider ${isActive ? 'text-white' : isCompleted ? 'text-slate-400' : 'text-slate-700'}`}>
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
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 text-white relative font-sans">
       {/* Background */}
       <div className="absolute inset-0 bg-mesh opacity-40 z-0"></div>
       <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0 pointer-events-none"></div>

      <div className="max-w-3xl w-full relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-white/5 rounded-2xl border border-white/10 mb-8 backdrop-blur-sm shadow-2xl">
             <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Dumbbell className="text-white" size={20} />
             </div>
             <span className="ml-3 mr-2 text-xl font-bold tracking-tight">FitnessOS</span>
             <span className="bg-primary-500/20 text-primary-300 text-[10px] font-bold px-2 py-0.5 rounded border border-primary-500/30">V2.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Launch your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-300">Dream Business</span> in seconds.
          </h1>
          <p className="text-xl text-slate-400 max-w-lg mx-auto leading-relaxed">
            The AI operating system used by elite fitness coaches to build, launch, and scale.
          </p>
        </div>

        <div className="bg-slate-900/80 p-1 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-cyan-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="bg-[#0B1121] rounded-[20px] p-8 md:p-10 relative">
                <label className="block text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={14} className="text-cyan-400" /> System Input
                </label>
                <form onSubmit={handleSubmit}>
                    <textarea
                    className="w-full h-40 p-5 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-white bg-black/50 text-lg placeholder:text-slate-600 shadow-inner transition-all mb-6 font-medium"
                    placeholder="e.g. I help busy corporate dads lose 20lbs in 90 days using kettlebells and intermittent fasting..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    />
                    
                    <button
                    type="submit"
                    disabled={!description.trim()}
                    className="w-full bg-white text-slate-950 py-5 rounded-xl font-bold text-lg hover:bg-cyan-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] shadow-xl"
                    >
                        Initialize Blueprint <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
        
        <div className="flex justify-center gap-8 mt-10 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> No Credit Card</span>
            <span className="flex items-center gap-2"><Cpu size={14} className="text-primary-500" /> Powered by Gemini 2.5</span>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
