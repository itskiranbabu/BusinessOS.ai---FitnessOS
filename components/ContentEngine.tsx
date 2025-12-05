import React, { useState } from 'react';
import { SocialPost, BusinessBlueprint } from '../types';
import { Calendar, Copy, Share2, Video, Image as ImageIcon, Type, Layers, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ContentEngineProps {
  blueprint: BusinessBlueprint;
  onUpdatePlan: (newPlan: SocialPost[]) => void;
  onRegenerate: () => Promise<SocialPost[]>;
}

const ContentEngine: React.FC<ContentEngineProps> = ({ blueprint, onUpdatePlan, onRegenerate }) => {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newPlan = await onRegenerate();
      if (newPlan && newPlan.length > 0) {
        onUpdatePlan(newPlan);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSchedule = (id: string) => {
      const updated = blueprint.contentPlan.map(post => 
          post.id === id ? { ...post, status: 'Scheduled' as const } : post
      );
      onUpdatePlan(updated);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Video': return <Video size={16} />;
      case 'Image': return <ImageIcon size={16} />;
      case 'Carousel': return <Layers size={16} />;
      default: return <Type size={16} />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Content Engine</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Your 30-day AI-generated social media strategy.</p>
        </div>
        <button 
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-70 flex items-center gap-2 shadow-lg transition-all"
        >
          <RefreshCw size={18} className={isRegenerating ? "animate-spin" : ""} />
          {isRegenerating ? 'Designing...' : 'Regenerate Plan'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blueprint.contentPlan.map((post) => (
          <div key={post.id} className={`bg-white dark:bg-slate-900 rounded-2xl border ${post.status === 'Scheduled' ? 'border-green-200 dark:border-green-900/50 ring-2 ring-green-100 dark:ring-green-900/20' : 'border-slate-200 dark:border-slate-800'} shadow-sm flex flex-col h-full hover:shadow-md dark:hover:shadow-slate-800/50 transition-all duration-300 relative overflow-hidden`}>
            
            {post.status === 'Scheduled' && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">
                    SCHEDULED
                </div>
            )}

            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={14} /> Day {post.day}
              </span>
              <span className="text-xs font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded text-slate-600 dark:text-slate-200 flex items-center gap-1 shadow-sm">
                {getIcon(post.type)} {post.type}
              </span>
            </div>
            
            <div className="p-6 flex-1 space-y-5">
              <div>
                <span className="text-xs text-primary-600 dark:text-primary-400 font-bold uppercase mb-2 block tracking-wider">Hook</span>
                <p className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{post.hook}</p>
              </div>
              
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase mb-2 block tracking-wider">Body / Script</span>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{post.body}</p>
              </div>

              <div>
                <span className="text-xs text-green-600 dark:text-green-400 font-bold uppercase mb-2 block tracking-wider">Call to Action</span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800/50 inline-block">
                  {post.cta}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700">
                <Copy size={16} /> Copy
              </button>
              <button 
                onClick={() => handleSchedule(post.id)}
                disabled={post.status === 'Scheduled'}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-colors border ${
                    post.status === 'Scheduled' 
                    ? 'bg-green-100 text-green-700 border-green-200 cursor-default' 
                    : 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 border-primary-100 dark:border-primary-900/30'
                }`}
              >
                {post.status === 'Scheduled' ? <><CheckCircle2 size={16}/> Scheduled</> : <><Share2 size={16} /> Schedule</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentEngine;