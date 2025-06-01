import React from "react";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";

interface ChatInfo {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  firstMessage?: string;
}

interface ChatSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  filteredChats: ChatInfo[];
  currentChatId?: string;
  onSwitchToChat: (chatId: string) => void;
  onCreateNewChat: () => void;
}

const ChatSwitcher: React.FC<ChatSwitcherProps> = ({
  isOpen,
  onClose,
  filteredChats,
  currentChatId,
  onSwitchToChat,
  onCreateNewChat,
}) => {
  if (!isOpen) return null;

  const handleSwitchToChat = (chatId: string) => {
    onSwitchToChat(chatId);
    onClose();
  };

  const handleCreateNewChat = () => {
    onCreateNewChat();
    onClose();
  };

  // Filter chats for today
  const todayChats = filteredChats.filter((chat) => {
    const chatDate = new Date(chat.updatedAt);
    const today = new Date();
    return chatDate.toDateString() === today.toDateString();
  });

  // Filter chats for history (not today)
  const historyChats = filteredChats
    .filter((chat) => {
      const chatDate = new Date(chat.updatedAt);
      const today = new Date();
      return chatDate.toDateString() !== today.toDateString();
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#E9E9E9] p-0 shadow-xl dark:bg-[#E9E9E9]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-gray-600 hover:bg-black/20 transition-all"
          aria-label="Close chat switcher"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Today section */}
        <div className="p-6">
          <h2 className="mb-6 text-xl font-semibold text-gray-500">Today</h2>

          <div className="space-y-4 max-h-60 overflow-y-auto">
            {todayChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleSwitchToChat(chat.id)}
                className={`w-full flex items-start text-left py-2 px-3 rounded-xl transition-colors
                  ${
                    currentChatId === chat.id
                      ? "bg-white dark:bg-white shadow-sm"
                      : "hover:bg-white/50 dark:hover:bg-white/50"
                  }`}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-black truncate">
                    {chat.title}
                  </h3>
                  {chat.firstMessage && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                      {chat.firstMessage}
                    </p>
                  )}
                </div>
              </button>
            ))}

            {todayChats.length === 0 && (
              <div className="py-6 text-center text-gray-500">
                No chats from today
              </div>
            )}
          </div>
        </div>

        {/* History section */}
        <div className="border-t border-gray-300 p-6 relative">
          <h2 className="text-xl font-medium text-black mb-6">History</h2>

          <div className="space-y-4 max-h-60 overflow-y-auto">
            {historyChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleSwitchToChat(chat.id)}
                className={`w-full flex items-start text-left py-2 px-3 rounded-xl transition-colors
                  ${
                    currentChatId === chat.id
                      ? "bg-white dark:bg-white shadow-sm"
                      : "hover:bg-white/50 dark:hover:bg-white/50"
                  }`}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-black truncate">
                    {chat.title}
                  </h3>
                  {chat.firstMessage && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                      {chat.firstMessage}
                    </p>
                  )}
                  <div className="mt-1 text-xs text-gray-400">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}

            {historyChats.length === 0 && (
              <div className="py-6 text-center text-gray-500">
                No older chats
              </div>
            )}
          </div>

          {/* New chat button */}
          <Button
            onClick={handleCreateNewChat}
            variant="default"
            size="icon"
            className="absolute bottom-6 right-6 h-14 w-14"
            aria-label="New Chat"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatSwitcher;
