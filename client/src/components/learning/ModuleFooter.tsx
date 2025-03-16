import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle 
} from 'lucide-react';

interface ModuleFooterProps {
  isCompleted: boolean;
  onComplete: () => void;
  onPrevious: () => void;
  onNext: () => void;
  currentModule: number;
  totalModules: number;
  previousModuleTitle: string | null;
  nextModuleTitle: string | null;
}

const ModuleFooter: React.FC<ModuleFooterProps> = ({
  isCompleted,
  onComplete,
  onPrevious,
  onNext,
  currentModule,
  totalModules,
  previousModuleTitle,
  nextModuleTitle,
}) => {
  return (
    <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10 shadow-[0_-2px_5px_rgba(0,0,0,0.03)]">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between">
          {/* Previous Module */}
          {previousModuleTitle ? (
            <button
              onClick={onPrevious}
              className="flex items-center py-2 px-4 text-sm text-gray-600 hover:text-indigo-600 group"
            >
              <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
              <div className="text-left">
                <div className="text-xs text-gray-400">Previous</div>
                <div className="font-medium truncate max-w-[160px]">
                  {previousModuleTitle}
                </div>
              </div>
            </button>
          ) : (
            <div className="w-[160px]"></div> {/* Empty space for alignment */}
          )}

          {/* Module Progress */}
          <div className="hidden md:block">
            <div className="flex items-center gap-2 h-full">
              {Array.from({ length: totalModules }).map((_, index) => (
                <div 
                  key={index}
                  className={`h-1.5 w-6 rounded-full ${
                    index < currentModule 
                      ? 'bg-indigo-600' 
                      : index === currentModule - 1 
                        ? 'bg-indigo-400' 
                        : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-center mt-1 text-gray-500">
              {currentModule} of {totalModules} modules
            </div>
          </div>

          {/* Main Action Button */}
          <div className="hidden sm:block md:hidden">
            {isCompleted ? (
              nextModuleTitle ? (
                <button
                  onClick={onNext}
                  className="py-2 px-5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm flex items-center gap-1"
                >
                  Next Module
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  className="py-2 px-5 bg-gray-100 text-gray-400 rounded-lg font-medium text-sm flex items-center gap-1 cursor-not-allowed"
                >
                  Course Completed
                  <CheckCircle className="w-4 h-4 ml-1" />
                </button>
              )
            ) : (
              <button
                onClick={onComplete}
                className="py-2 px-5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center gap-1"
              >
                Mark as Complete
                <CheckCircle className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>

          {/* Next Module */}
          {nextModuleTitle ? (
            <button
              onClick={isCompleted ? onNext : onComplete}
              className={`flex items-center py-2 px-4 text-sm group ${
                isCompleted 
                  ? 'text-gray-600 hover:text-indigo-600' 
                  : 'text-green-600 hover:text-green-700'
              }`}
            >
              <div className="text-right">
                <div className="text-xs text-gray-400">
                  {isCompleted ? 'Next' : 'Complete & Continue'}
                </div>
                <div className="font-medium truncate max-w-[160px]">
                  {nextModuleTitle}
                </div>
              </div>
              {isCompleted ? (
                <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              ) : (
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              )}
            </button>
          ) : (
            <div className="flex items-center py-2 px-4 text-sm text-green-600">
              <div className="text-right">
                <div className="text-xs text-gray-400">Course</div>
                <div className="font-medium">Complete!</div>
              </div>
              <CheckCircle className="w-4 h-4 ml-1" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleFooter;