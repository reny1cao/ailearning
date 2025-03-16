import React from "react";
import { BookOpen, Layout, Bookmark } from "lucide-react";
import { cn } from "../../../lib/utils";
import useApiHealth from "../../../hooks/useApiHealth";

interface MobileNavigationProps {
  activeTab: "content" | "modules" | "ai" | "notes";
  onTabChange: (tab: "content" | "modules" | "ai" | "notes") => void;
  showAITeacherChat?: boolean;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onTabChange,
  showAITeacherChat = false,
}) => {
  // Use the API health hook to check if AI teacher is available
  const { status: apiStatus, isAvailable } = useApiHealth();

  const tabs = [
    { id: "content" as const, label: "Content", icon: BookOpen },
    { id: "modules" as const, label: "Modules", icon: Layout },
    { id: "notes" as const, label: "Notes", icon: Bookmark },
  ];

  // If AI teacher chat is visible and active tab is 'ai', don't show the navigation
  if (showAITeacherChat && activeTab === "ai") {
    return null;
  }

  return (
    <div className="md:hidden flex items-center justify-around border-t border-gray-200 bg-white p-2 fixed bottom-0 left-0 right-0 z-30">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            className={cn(
              "p-2 flex flex-col items-center",
              isActive ? "text-indigo-600" : "text-gray-500"
            )}
            onClick={() => onTabChange(tab.id)}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
          >
              <Icon className="w-5 h-5" />
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileNavigation;
