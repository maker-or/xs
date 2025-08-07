import { ArrowLeftRight, FileText, Plus, Trash } from 'lucide-react';
import type React from 'react';
// import { Button } from './ui/Button';
// import ThemeToggle from './theme-toggle';
import { type ModelOption, ModelSelector } from './ModelSelector';

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
    className={`sticky top-1 m-3 w-fit rounded-md border-gray-200 border-b bg-[#f8f8f8] shadow-md backdrop-blur-md transition-transform duration-300 dark:border-[#f7eee332] dark:bg-[#0d0d0d] ${showNav || isMobile ? 'translate-y-0' : '-translate-y-full'}`}
  >
    <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-2 sm:px-4">
      {/* Desktop actions */}
      <div className="hidden items-center space-x-2 md:flex">
        <button
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-[#575757]"
          onClick={createNewChat}
        >
          <Plus className="h-4 w-4" />
          <span>New</span>
        </button>
        <button
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-[#575757]"
          onClick={openChatSwitcher}
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>Switch</span>
        </button>
        <button
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-[#575757]"
          onClick={clearHistory}
        >
          <Trash className="h-4 w-4" />
          <span>Delete</span>
        </button>
        <button
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-[#575757]"
          onClick={exportPDF}
        >
          <FileText className="h-4 w-4" />
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
          modelOptions={modelOptions}
          onModelChange={onModelChange}
          selectedModel={selectedModel}
          showModelSelector={showModelSelector}
        />
      </div>

      {/* Mobile actions */}
      <div className="flex items-center space-x-2 md:hidden">
        <button
          className="rounded-lg p-2 hover:bg-gray-200 dark:hover:bg-[#575757]"
          onClick={toggleMobileMenu}
        >
          {/* Hamburger icon */}
          <div className="flex h-5 w-5 flex-col justify-between">
            <span
              className={`${showMobileMenu ? 'translate-y-1.5 rotate-45' : ''} block h-0.5 w-full bg-current transition-all`}
            />

            <span
              className={`${showMobileMenu ? 'opacity-0' : 'opacity-100'} block h-0.5 w-full bg-current transition-all`}
            />

            <span
              className={`${showMobileMenu ? '-rotate-45 -translate-y-1.5' : ''} block h-0.5 w-full bg-current transition-all`}
            />
          </div>
        </button>
        <button
          className="rounded-xl bg-[#151515] p-3 text-white shadow-lg hover:bg-[#48AAFF]"
          onClick={createNewChat}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {showMobileMenu && (
        <div className="absolute top-14 right-2 z-30 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-[#252525]">
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => onMenuAction(createNewChat)}
          >
            New Chat
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => onMenuAction(openChatSwitcher)}
          >
            Switch Chat
          </button>
          <button
            className="dark:hover:bg.gray-700 w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => onMenuAction(clearHistory)}
          >
            Delete Chat
          </button>
          <button
            className="dark:hover:bg.gray-700 w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => onMenuAction(exportPDF)}
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
