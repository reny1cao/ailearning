import React from 'react';
import { Module, UserProgress } from '../../types/database';
import { cn } from '../../lib/utils';
import { CheckCircle } from 'lucide-react';

interface CourseSidebarProps {
  title: string;
  modules: Module[];
  progress: UserProgress[];
  currentModuleId: string;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  onModuleSelect: (moduleId: string) => void;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  title,
  modules,
  progress,
  currentModuleId,
  sidebarOpen,
  onCloseSidebar,
  onModuleSelect,
}) => {
  const completedModules = progress.filter(p => p.completed).length;
  const progressPercentage = (completedModules / modules.length) * 100;

  const ModuleList = () => (
    <div className="flex flex-col space-y-2">
      {modules.map((module, index) => {
        const isComplete = progress.some(p => p.module_id === module.id && p.completed);
        const isCurrent = module.id === currentModuleId;

        return (
          <button
            key={module.id}
            onClick={() => onModuleSelect(module.id)}
            className={cn(
              "flex items-center p-4 rounded-lg transition-all duration-300",
              "hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98]",
              isCurrent && "bg-indigo-50 hover:bg-indigo-50"
            )}
          >
            <div className={cn(
              "w-8 h-8 flex items-center justify-center rounded-full mr-4 transition-all duration-300",
              isComplete ? "bg-green-100" : 
              isCurrent ? "bg-indigo-100" : 
              "bg-gray-100"
            )}>
              {isComplete ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <span className={cn(
                  "text-sm font-medium",
                  isCurrent ? "text-indigo-600" : "text-gray-500"
                )}>
                  {index + 1}
                </span>
              )}
            </div>
            <div className="flex-1 text-left">
              <div className={cn(
                "font-medium line-clamp-1 mb-1",
                isCurrent ? "text-indigo-600" : "text-gray-900"
              )}>
                {module.title}
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span>{module.estimated_time} min</span>
                {isComplete && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="text-green-600">Completed</span>
                  </>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="font-semibold text-xl text-gray-900 mb-4">{title}</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-900">Course Progress</span>
            <span className="text-indigo-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <ModuleList />
      </div>
    </div>
  );

  // For desktop sidebar
  const DesktopSidebar = () => (
    <div className={cn(
      "hidden lg:block border-r bg-white overflow-hidden transition-all duration-300",
      sidebarOpen ? "w-[300px]" : "w-0"
    )}>
      <div className={cn(
        "w-[300px] h-full flex flex-col",
        "transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </div>
    </div>
  );

  // For mobile sidebar (rendered through Sheet in ModuleNavigation)
  const MobileSidebar = () => (
    <div className="h-full bg-white">
      <SidebarContent />
    </div>
  );

  // Return different versions based on context
  return (
    <>
      <DesktopSidebar />
      <div className="lg:hidden">
        <MobileSidebar />
      </div>
    </>
  );
};

export default CourseSidebar;