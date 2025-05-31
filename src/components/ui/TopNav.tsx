import React from "react";
import {
  Plus,
  ArrowLeftRight,
  Trash,
  FileText,

} from "lucide-react";
// import { Button } from './ui/Button';
// import ThemeToggle from './theme-toggle';
import { ModelSelector, ModelOption } from "./ModelSelector";

interface TopNavProps {
  createNewChat(): void;
  openChatSwitcher(): void;
  clearHistory(): void;
  exportPDF(): void;
  // saveEdits(): void;
  showNav: boolean;
  isMobile: boolean;
  showMobileMenu: boolean;
  toggleMobileMenu(): void;
  onMenuAction(action: () => void): void;
  selectedModel: string;
  showModelSelector: boolean;
  onModelChange(id: string): void;
  modelOptions: ModelOption[];
}

export const TopNav: React.FC<TopNavProps> = ({
  createNewChat,
  openChatSwitcher,
  clearHistory,
  exportPDF,
  // saveEdits,
  showNav,
  isMobile,
  showMobileMenu,
  toggleMobileMenu,
  onMenuAction,
  selectedModel,
  showModelSelector,
  onModelChange,
  modelOptions,
}) => (
  <nav
    className={`sticky top-1 m-3 w-fit rounded-md bg-[#f8f8f8] dark:bg-[#0d0d0d] border-b border-gray-200 dark:border-[#f7eee332] backdrop-blur-md shadow-md transition-transform duration-300 ${showNav || isMobile ? "translate-y-0" : "-translate-y-full"}`}
  >
    <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between h-14">
      {/* Desktop actions */}
      <div className="hidden md:flex items-center space-x-2">
        <button
          onClick={createNewChat}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-[#575757]"
        >
          <Plus className="w-4 h-4" />
          <span>New</span>
        </button>
        <button
          onClick={openChatSwitcher}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-[#575757]"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Switch</span>
        </button>
        <button
          onClick={clearHistory}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-[#575757]"
        >
          <Trash className="w-4 h-4" />
          <span>Delete</span>
        </button>
        <button
          onClick={exportPDF}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-[#575757]"
        >
          <FileText className="w-4 h-4" />
          <span>Export</span>
        </button>
        {/* {isDesignMode && (
          <button
            onClick={saveEdits}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        )} */}
        {/* Model selector */}
        <ModelSelector
          selectedModel={selectedModel}
          showModelSelector={showModelSelector}
          onModelChange={onModelChange}
          modelOptions={modelOptions}
        />
      </div>

      {/* Mobile actions */}
      <div className="flex md:hidden items-center space-x-2">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#575757]"
        >
          {/* Hamburger icon */}
          <div className="w-5 h-5 flex flex-col justify-between">
            <span
              className={`${showMobileMenu ? "rotate-45 translate-y-1.5" : ""} block h-0.5 w-full bg-current transition-all`}
            />

            <span
              className={`${showMobileMenu ? "opacity-0" : "opacity-100"} block h-0.5 w-full bg-current transition-all`}
            />

            <span
              className={`${showMobileMenu ? "-rotate-45 -translate-y-1.5" : ""} block h-0.5 w-full bg-current transition-all`}
            />
          </div>
        </button>
        <button
          onClick={createNewChat}
          className="p-3 rounded-xl bg-[#151515] text-white hover:bg-[#48AAFF] shadow-lg"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {showMobileMenu && (
        <div className="absolute right-2 top-14 z-30 w-48 bg-white dark:bg-[#252525] rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
          <button
            onClick={() => onMenuAction(createNewChat)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            New Chat
          </button>
          <button
            onClick={() => onMenuAction(openChatSwitcher)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Switch Chat
          </button>
          <button
            onClick={() => onMenuAction(clearHistory)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg.gray-700"
          >
            Delete Chat
          </button>
          <button
            onClick={() => onMenuAction(exportPDF)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg.gray-700"
          >
            Export PDF
          </button>
          {/* {isDesignMode && (
            <button
              onClick={() => onMenuAction(saveEdits)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover.bg.gray-700"
            >
              Save
            </button>
          )} */}
        </div>
      )}
    </div>
  </nav>
);

export default TopNav;
