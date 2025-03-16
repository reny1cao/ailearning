import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Lightbulb,
  Info,
  Book,
  Code,
  Zap,
  ChevronDown,
  ChevronRight,
  X,
  Maximize2,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import AITeacherCompanion from "./AITeacherCompanion";
import IdeaBubble from "./IdeaBubble";

const AICompanionDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"floating" | "sidebar" | "ideas">(
    "floating"
  );
  const [showFullOverlay, setShowFullOverlay] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  const [dismissedIdeas, setDismissedIdeas] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Demo content for the page
  const pageContent = {
    title: "Neural Networks: Building Blocks for Machine Learning",
    subtitle: "A Beginner's Guide to Understanding Neural Networks",
    author: "Dr. AI Teacher",
    sections: [
      {
        title: "Introduction to Neural Networks",
        paragraphs: [
          "Neural networks are a set of algorithms, modeled loosely after the human brain, that are designed to recognize patterns. They interpret sensory data through a kind of machine perception, labeling or clustering raw input.",
          "These algorithms are at the heart of deep learning, a subfield of machine learning that is transforming how we interact with technology. Neural networks have contributed to significant advancements in computer vision, natural language processing, and data analysis.",
        ],
      },
      {
        title: "The Structure of Neural Networks",
        paragraphs: [
          "A neural network consists of layers of interconnected nodes or 'neurons'. Each connection between neurons has a weight that determines the strength of one node's influence on another.",
          "A basic neural network has three types of layers: the input layer (receiving the initial data), the hidden layers (where mathematical computations are performed), and the output layer (providing the result).",
          "The power of neural networks comes from their ability to learn from data. By adjusting the weights through a process called backpropagation, neural networks can minimize errors and improve their predictions over time.",
        ],
      },
      {
        title: "Applications of Neural Networks",
        paragraphs: [
          "Neural networks have a wide range of applications across various domains. In healthcare, they're used for medical image analysis, disease prediction, and drug discovery.",
          "In finance, neural networks help with fraud detection, risk assessment, and automated trading. The ability to identify patterns in complex financial data makes them invaluable tools for financial institutions.",
          "Perhaps most visibly, neural networks power modern AI systems like speech recognition, recommendation engines, and autonomous vehicles. The flexibility of neural network architectures allows them to be adapted to diverse problems.",
        ],
      },
    ],
  };

  // Sample ideas that would be triggered contextually in a real app
  const ideas = [
    {
      id: "idea-1",
      content:
        "Neurons in neural networks are inspired by biological neurons but function very differently. Want to learn about the differences?",
      type: "insight" as const,
      position: "right" as const,
      paragraphIndex: 0,
      actionLabel: "Compare them",
    },
    {
      id: "idea-2",
      content:
        "Backpropagation is the key algorithm behind neural network training. It's how networks learn from their mistakes.",
      type: "tip" as const,
      position: "right" as const,
      paragraphIndex: 4,
      actionLabel: "Learn about backpropagation",
    },
    {
      id: "idea-3",
      content:
        "Did you know that neural networks can generate art, music, and even write stories? These are called generative models.",
      type: "question" as const,
      position: "right" as const,
      paragraphIndex: 7,
      actionLabel: "Explore generative AI",
    },
  ];

  // Handle idea action (e.g., ask the AI teacher about the topic)
  const handleIdeaAction = (ideaContent: string) => {
    // In a real implementation, this would send a message to the AI teacher
    console.log("Opening AI teacher with:", ideaContent);
    // Expand the companion if it's collapsed
    setShowFullOverlay(true);
  };

  // Handle dismissing an idea
  const handleDismissIdea = (id: string) => {
    setDismissedIdeas((prev) => [...prev, id]);
  };

  // Calculate which ideas should be shown based on scroll position and dismissals
  const visibleIdeas = ideas.filter(
    (idea) =>
      !dismissedIdeas.includes(idea.id) &&
      activeParagraph === idea.paragraphIndex
  );

  // Handle paragraph hover to show relevant ideas
  const handleParagraphHover = (index: number) => {
    setActiveParagraph(index);
  };

  // Get all paragraphs from all sections for indexing
  const allParagraphs = pageContent.sections.flatMap(
    (section) => section.paragraphs
  );

  // Toggle between demo modes
  const handleTabChange = (tab: "floating" | "sidebar" | "ideas") => {
    setActiveTab(tab);
  };

  // Handle maximizing the companion to full screen
  const handleMaximize = () => {
    setShowFullOverlay(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Demo Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Learning Companion Demo
              </h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleTabChange("floating")}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md",
                  activeTab === "floating"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                    : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                Floating Companion
              </button>
              <button
                onClick={() => handleTabChange("sidebar")}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md",
                  activeTab === "sidebar"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                    : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                Sidebar Companion
              </button>
              <button
                onClick={() => handleTabChange("ideas")}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md",
                  activeTab === "ideas"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                    : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                Idea Bubbles
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "relative mx-auto pt-6 pb-24",
          activeTab === "sidebar" ? "flex" : "",
          activeTab === "ideas" ? "max-w-3xl" : "max-w-7xl"
        )}
      >
        {/* Sidebar Mode */}
        {activeTab === "sidebar" && (
          <div className="w-80 flex-shrink-0">
            <AITeacherCompanion
              mode="sidebar"
              position="left"
              initialExpanded={true}
              contextTitle={pageContent.title}
              currentTopic="Neural Networks"
              onMaximize={handleMaximize}
            />
          </div>
        )}

        {/* Article Content */}
        <div
          ref={contentRef}
          className={cn(
            "px-4 sm:px-6 lg:px-8",
            activeTab === "sidebar" ? "flex-1 pl-6" : ""
          )}
        >
          <header className="max-w-3xl mx-auto mb-8">
            <div className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 text-sm mb-4">
              <Book className="w-4 h-4" />
              <span>Machine Learning</span>
              <ChevronRight className="w-4 h-4" />
              <span>Neural Networks</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
              {pageContent.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              {pageContent.subtitle}
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mr-2">
                  <FileText className="w-4 h-4" />
                </div>
                <span>By {pageContent.author}</span>
              </div>
              <span className="mx-2">•</span>
              <span>10 min read</span>
            </div>
          </header>

          <div className="prose prose-indigo dark:prose-invert max-w-3xl mx-auto">
            {pageContent.sections.map((section, sectionIndex) => (
              <section key={sectionIndex} className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {section.title}
                </h2>
                {section.paragraphs.map((paragraph, pIndex) => {
                  // Calculate the overall paragraph index across all sections
                  const overallPIndex =
                    pageContent.sections
                      .slice(0, sectionIndex)
                      .reduce((acc, s) => acc + s.paragraphs.length, 0) +
                    pIndex;

                  return (
                    <div
                      key={pIndex}
                      className="relative mb-4"
                      onMouseEnter={() => handleParagraphHover(overallPIndex)}
                      onMouseLeave={() => setActiveParagraph(null)}
                    >
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {paragraph}
                      </p>

                      {/* Show idea bubbles on this paragraph when active */}
                      {activeTab === "ideas" &&
                        visibleIdeas.map((idea) => (
                          <IdeaBubble
                            key={idea.id}
                            id={idea.id}
                            content={idea.content}
                            type={idea.type}
                            position={idea.position}
                            actionLabel={idea.actionLabel}
                            onAction={() => handleIdeaAction(idea.content)}
                            onDismiss={handleDismissIdea}
                          />
                        ))}
                    </div>
                  );
                })}
              </section>
            ))}

            <div className="flex items-center p-4 border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mt-8">
              <Lightbulb className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                  Learning Insight
                </h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">
                  Neural networks excel at finding patterns in complex data. The
                  more quality data they're trained on, the better their
                  predictions become.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Mode */}
        {activeTab === "floating" && (
          <AITeacherCompanion
            mode="floating"
            position="right"
            initialExpanded={false}
            contextTitle={pageContent.title}
            currentTopic="Neural Networks"
            onMaximize={handleMaximize}
          />
        )}
      </div>

      {/* Full Overlay Mode */}
      {showFullOverlay && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-md p-1.5 mr-2">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    AI Learning Assistant
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Neural Networks Topic
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFullOverlay(false)}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
                {/* This would be replaced with your actual AITeacherChat component */}
                <div className="flex">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                    <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <p className="text-gray-800 dark:text-gray-200">
                      Welcome! I'm your AI learning assistant for neural
                      networks. What would you like to explore about this topic?
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="px-3 py-1.5 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                        How do neural networks learn?
                      </button>
                      <button className="px-3 py-1.5 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                        Explain activation functions
                      </button>
                      <button className="px-3 py-1.5 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                        What are CNNs used for?
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center ml-3 flex-shrink-0">
                    <div className="font-semibold text-purple-600 dark:text-purple-400">
                      U
                    </div>
                  </div>
                  <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg shadow-sm">
                    <p className="text-gray-800 dark:text-gray-200">
                      Can you explain how backpropagation works in simple terms?
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                    <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <p className="text-gray-800 dark:text-gray-200 mb-2">
                      Backpropagation is like learning from your mistakes.
                      Here's a simple explanation:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      <li>The neural network makes a prediction</li>
                      <li>We compare the prediction to the actual answer</li>
                      <li>
                        We calculate the error (how wrong the prediction was)
                      </li>
                      <li>
                        We adjust the network's weights backward from output to
                        input
                      </li>
                      <li>
                        This adjustment helps the network make better
                        predictions next time
                      </li>
                    </ol>
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center mb-2">
                        <Code className="w-4 h-4 text-indigo-500 mr-1" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Simplified Pseudocode
                        </span>
                      </div>
                      <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                        {`for each training example:
  prediction = forward_pass(input)
  error = calculate_error(prediction, actual)
  adjust_weights = backward_pass(error)
  update_network(adjust_weights)`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Ask a question about neural networks..."
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                />
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-r-lg">
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AICompanionDemo;
