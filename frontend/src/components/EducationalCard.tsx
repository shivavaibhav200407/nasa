import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Lightbulb, Sparkles } from 'lucide-react';
import type { DifficultyMode, EducationalFeedback } from '../types/mission';

interface EducationalCardProps {
  feedback: EducationalFeedback[];
  mode: DifficultyMode;
}

export const EducationalCard: React.FC<EducationalCardProps> = ({ feedback, mode }) => {
  const isExplorer = mode === 'EXPLORER';
  const [isExpanded, setIsExpanded] = useState<boolean>(isExplorer);

  if (!feedback || feedback.length === 0) return null;

  return (
    <div className="hud-panel p-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-astra-accent/15 border border-astra-accent/40 text-astra-accent shadow-inner">
            <Lightbulb className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display text-xs uppercase tracking-wider text-astra-accent font-bold flex items-center gap-1.5">
              <span>{isExplorer ? 'Educational Concept: Why This Happened' : 'Mission Engineering STEM Debrief'}</span>
              <Sparkles className="w-3 h-3 text-astra-accent" />
            </h3>
            <p className="text-[11px] font-mono text-astra-muted">
              Grounded in verified ECLSS closed-loop life-support principles
            </p>
          </div>
        </div>

        {!isExplorer && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-astra-raised hover:bg-astra-border text-astra-text border border-astra-border transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-astra-accent" />
            <span>{isExpanded ? 'Collapse Principles' : 'Inspect Scientific Principles'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {(isExplorer || isExpanded) && (
        <div className="mt-3.5 space-y-2.5 pt-3.5 border-t border-astra-border">
          {feedback.map((item) => (
            <div
              key={item.feedback_id}
              className="p-3 rounded-lg bg-astra-raised border border-astra-border text-xs font-sans leading-relaxed text-astra-text shadow-inner"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold font-mono text-white text-xs">
                  {item.title}
                </span>
                <span className="text-[10px] font-mono text-astra-accent px-2 py-0.5 rounded-full bg-astra-surface border border-astra-accent/30 font-semibold">
                  {item.concept_area}
                </span>
              </div>
              <p className="text-astra-muted text-xs">
                {item.fact_summary}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
