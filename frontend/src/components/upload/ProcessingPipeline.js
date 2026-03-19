import { motion } from 'framer-motion';
import { Check, Loader2, Upload, FileVideo, Image, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

const STAGES = [
  { id: 'uploading', label: 'Uploading', icon: Upload },
  { id: 'compressing', label: 'Compressing', icon: FileVideo },
  { id: 'transcoding', label: 'Converting to HLS', icon: FileVideo },
  { id: 'thumbnail', label: 'Generating Thumbnail', icon: Image },
  { id: 'analyzing', label: 'Analyzing Content', icon: Sparkles },
  { id: 'complete', label: 'Ready', icon: Check }
];

export function ProcessingPipeline({ currentStage, progress }) {
  const currentStageIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className="w-full space-y-3" data-testid="processing-pipeline">
      {STAGES.map((stage, index) => {
        const Icon = stage.icon;
        const isComplete = index < currentStageIndex || currentStage === 'complete';
        const isCurrent = index === currentStageIndex && currentStage !== 'complete';
        const isPending = index > currentStageIndex;

        return (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
              isComplete && "bg-emerald-500/10",
              isCurrent && "bg-violet-500/10",
              isPending && "opacity-40"
            )}
            data-testid={`stage-${stage.id}`}
          >
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
              isComplete && "bg-emerald-500/20",
              isCurrent && "bg-violet-500/20",
              isPending && "bg-zinc-800"
            )}>
              {isCurrent ? (
                <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
              ) : isComplete ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Icon className="w-5 h-5 text-zinc-500" />
              )}
            </div>

            <div className="flex-1">
              <p className={cn(
                "text-sm font-medium transition-colors duration-300",
                isComplete && "text-emerald-400",
                isCurrent && "text-violet-400",
                isPending && "text-zinc-500"
              )}>
                {stage.label}
              </p>
              
              {/* Progress bar for upload stage */}
              {stage.id === 'uploading' && isCurrent && (
                <div className="mt-1.5 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full gradient-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>

            {isComplete && (
              <span className="text-xs text-emerald-400 font-medium">Done</span>
            )}
            {isCurrent && stage.id === 'uploading' && (
              <span className="text-xs text-violet-400 font-medium font-heading">{Math.round(progress)}%</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
