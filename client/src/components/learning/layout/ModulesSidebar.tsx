import React from "react";
import {
  CheckCircle,
  Book,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  BookOpen,
} from "lucide-react";
import { Module } from "../../../types/database";

interface Progress {
  module_id: string;
  completed: boolean;
}

interface ModulesSidebarProps {
  modules: Module[];
  currentModuleId?: string;
  courseId?: string;
  progress: Progress[];
  onModuleSelect: (moduleId: string) => void;
  showSidebar: boolean;
  toggleSidebar: () => void;
}

const ModulesSidebar: React.FC<ModulesSidebarProps> = ({
  modules,
  currentModuleId,
  courseId,
  progress,
  onModuleSelect,
  showSidebar,
  toggleSidebar,
}) => {
  // Calculate overall progress
  const completedModulesCount = progress.filter((p) => p.completed).length;
  const overallProgress =
    modules.length > 0
      ? Math.round((completedModulesCount / modules.length) * 100)
      : 0;

  const courseTitle = "Learning Path"; // Default title

  // Group modules by sections (assuming every 3 modules form a section)
  const groupedModules = modules.reduce<{ title: string; modules: Module[] }[]>(
    (acc, module, index) => {
      const sectionIndex = Math.floor(index / 3);
      if (!acc[sectionIndex]) {
        acc[sectionIndex] = {
          title: `Section ${sectionIndex + 1}`,
          modules: [],
        };
      }
      acc[sectionIndex].modules.push(module);
      return acc;
    },
    []
  );

  return (
    <div className="flex flex-row h-full">
      {/* Mini sidebar - only display when main sidebar is collapsed */}
      <div
        className={`${
          showSidebar ? "hidden" : "hidden md:block"
        } w-10 border-r border-gray-200 bg-white pb-3 overflow-y-auto z-20 flex-shrink-0`}
      >
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>

        <div className="my-3 p-1.5 rounded-full bg-indigo-100 mx-auto">
          <BookOpen className="w-5 h-5 text-indigo-600" />
        </div>

        <div className="h-px w-6 bg-gray-200 mb-3 mx-auto"></div>

        {modules.map((item, index) => {
          const isComplete = progress.some(
            (p) => p.module_id === item.id && p.completed
          );
          const isCurrent = item.id === currentModuleId;

          return (
            <button
              key={item.id}
              className={`w-8 h-8 mb-2 rounded-full flex items-center justify-center mx-auto ${
                isCurrent
                  ? "bg-indigo-100 text-indigo-600"
                  : isComplete
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-600"
              } hover:scale-110 transition-transform`}
              onClick={() => onModuleSelect(item.id)}
              title={item.title}
            >
              {isComplete ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main sidebar */}
      <aside
        className={`border-r border-gray-200 bg-gradient-to-b from-white to-gray-50 transition-all duration-300 ease-in-out fixed md:relative top-14 md:top-0 bottom-0 z-30 ${
          showSidebar
            ? "w-64 translate-x-0"
            : "-translate-x-full md:translate-x-0 md:w-0 md:opacity-0"
        }`}
      >
        {/* Only render content when sidebar is visible to improve performance */}
        {showSidebar && (
          <>
            <div className="p-5 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-bold text-gray-900 line-clamp-2">
                    {courseTitle}
                  </h2>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-gray-600">Progress</span>
                </div>
                <div className="text-indigo-600 font-semibold">
                  {overallProgress}%
                </div>
              </div>

              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 ease-out"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <span>{completedModulesCount} completed</span>
                <span>{modules.length} modules</span>
              </div>
            </div>

            <div className="overflow-y-auto h-full pb-20 md:pb-3">
              <div className="pt-2">
                {groupedModules.map((section, sectionIndex) => (
                  <div key={`section-${sectionIndex}`} className="mb-3">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {section.title}
                    </div>
                    <nav className="px-2">
                      <div className="space-y-1">
                        {section.modules.map((item, index) => {
                          const isComplete = progress.some(
                            (p) => p.module_id === item.id && p.completed
                          );
                          const isCurrent = item.id === currentModuleId;

                          return (
                            <button
                              key={item.id}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all ${
                                isCurrent
                                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                  : isComplete
                                  ? "text-gray-700 hover:bg-gray-50"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                              onClick={() => {
                                if (!isCurrent) {
                                  onModuleSelect(item.id);
                                }
                              }}
                            >
                              <div
                                className={`w-6 h-6 flex items-center justify-center rounded-full ${
                                  isComplete
                                    ? "bg-green-100 text-green-600"
                                    : isCurrent
                                    ? "bg-indigo-100 text-indigo-600"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {isComplete ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <span>{sectionIndex * 3 + index + 1}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="line-clamp-2 font-medium">
                                  {item.title}
                                </div>
                                <div className="flex items-center mt-1 text-xs text-gray-500">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>{5 + index} min</span>
                                  {isComplete && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-green-50 text-green-600 rounded">
                                      Completed
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </nav>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default ModulesSidebar;
