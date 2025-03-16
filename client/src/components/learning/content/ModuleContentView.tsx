import React, { useRef } from "react";
import {
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  BookOpen,
  Bookmark,
  Share2,
} from "lucide-react";
import RichTextContent from "../../RichTextContent";

interface Note {
  id: string;
  content: string;
  timestamp: Date;
  type: "note" | "highlight" | "bookmark";
  selection?: string;
}

interface ModuleContentViewProps {
  content: string;
  fontSizeClass: string;
  isTransitioning: boolean;
  notes: Note[];
  isCurrentModuleComplete: boolean;
  currentModuleIndex: number;
  totalModules: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  onTextSelection: (event: MouseEvent) => void;
}

const ModuleContentView: React.FC<ModuleContentViewProps> = ({
  content,
  fontSizeClass,
  isTransitioning,
  notes,
  isCurrentModuleComplete,
  currentModuleIndex,
  totalModules,
  onPrevious,
  onNext,
  onComplete,
  onTextSelection,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const highlights = notes.filter((note) => note.type === "highlight");
  const bookmarks = notes.filter((note) => note.type === "bookmark");

  // Estimated reading time (very rough calculation)
  const wordCount = content.split(/\s+/).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200)); // Assuming 200 words per minute

  const ModuleActions = () => (
    <div className="flex justify-center gap-2 my-8">
      <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
        <Bookmark className="w-5 h-5" />
      </button>
      <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
        <Share2 className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="mb-6 flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-500">
          <Clock className="w-4 h-4 mr-1.5" />
          <span>{readingTimeMinutes} min read</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-indigo-600 hover:text-indigo-800 transition-colors">
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        ref={contentRef}
        onMouseUp={(e) => onTextSelection(e.nativeEvent)}
        className={`bg-white rounded-xl shadow-md p-6 sm:p-8 ${
          isTransitioning
            ? "opacity-0 transform translate-y-4"
            : "opacity-100 transform translate-y-0"
        } transition-all duration-300`}
      >
        <div
          className={`prose prose-indigo max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-indigo-600 prose-strong:text-gray-700 prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 ${fontSizeClass}`}
        >
          <RichTextContent content={content} />
        </div>

        <ModuleActions />
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="mt-8 p-6 bg-amber-50 border border-amber-100 rounded-xl">
          <h3 className="flex items-center gap-2 font-semibold text-amber-800 mb-4">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            Your Highlights
          </h3>
          <div className="space-y-4">
            {highlights.map((note) => (
              <div
                key={note.id}
                className="p-4 bg-white border border-amber-100 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-sm text-gray-700 italic">"{note.content}"</p>
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-gray-400">
                    {note.timestamp.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookmarks Section */}
      {bookmarks.length > 0 && (
        <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-xl">
          <h3 className="flex items-center gap-2 font-semibold text-blue-800 mb-4">
            <Bookmark className="w-4 h-4 text-blue-600" />
            Your Bookmarks
          </h3>
          <div className="space-y-4">
            {bookmarks.map((note) => (
              <div
                key={note.id}
                className="p-4 bg-white border border-blue-100 rounded-lg shadow-sm"
              >
                <p className="text-sm text-gray-700">"{note.content}"</p>
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-gray-400">
                    {note.timestamp.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module Navigation at Bottom */}
      <div className="mt-12 mb-10 flex items-center justify-between border-t border-gray-200 pt-6">
        <button
          onClick={onPrevious}
          disabled={currentModuleIndex === 0}
          className={`px-5 py-2.5 rounded-lg border flex items-center gap-2 font-medium text-sm transition-colors ${
            currentModuleIndex === 0
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={isCurrentModuleComplete ? onNext : onComplete}
          className={`px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all hover:shadow ${
            isCurrentModuleComplete
              ? currentModuleIndex < totalModules - 1
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-green-600 text-white hover:bg-green-700"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {isCurrentModuleComplete ? (
            currentModuleIndex < totalModules - 1 ? (
              <>
                <span>Next Module</span>
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Complete Course</span>
                <CheckCircle className="w-4 h-4" />
              </>
            )
          ) : (
            <>
              <span>Mark as Complete</span>
              <CheckCircle className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ModuleContentView;
