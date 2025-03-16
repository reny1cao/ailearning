import React from "react";
import { BookOpen, Layout, Bot, Bookmark } from "lucide-react";

interface MobileNavigationProps {
  activeTab: "content" | "modules" | "ai" | "notes";
  onTabChange: (tab: "content" | "modules" | "ai" | "notes") => void;
  showAIChat?: boolean;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onTabChange,
  showAIChat = false,
}) => {
  const tabs = [
    { id: "content", label: "Content", icon: BookOpen },
    { id: "modules", label: "Modules", icon: Layout },
    { id: "ai", label: "AI Tutor", icon: Bot },
    { id: "notes", label: "Notes", icon: Bookmark },
  ] as const;

  return (
    <div className={`md:hidden flex items-center justify-around border-t border-gray-200 bg-white p-2 fixed bottom-0 left-0 right-0 z-30 ${showAIChat && activeTab === "ai" ? "hidden" : ""}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            className={`p-2 flex flex-col items-center ${
              isActive ? "text-indigo-600" : "text-gray-500"
            }`}
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
