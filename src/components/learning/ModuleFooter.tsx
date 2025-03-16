import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface ModuleFooterProps {
  onBack: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}

const ModuleFooter: React.FC<ModuleFooterProps> = ({
  onBack,
  onComplete,
  isCompleted,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="flex justify-between items-center py-4">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>
        <Button
          onClick={onComplete}
          variant={isCompleted ? "secondary" : "default"}
          className={`${
            isCompleted 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed
            </>
          ) : (
            <>
              Complete & Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ModuleFooter;