import { X } from 'lucide-react';
import type React from 'react';
import { Button } from '~/components/ui/button';

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
          aria-label="Close chat switcher"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-gray-600 transition-all hover:bg-black/20"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Today section */}
        <div className="p-6">
          <h2 className="mb-6 font-semibold text-gray-500 text-xl">Today</h2>

          <div className="max-h-60 space-y-4 overflow-y-auto">
            {todayChats.map((chat) => (
              <button
                className={`flex w-full items-start rounded-xl px-3 py-2 text-left transition-colors ${
                  currentChatId === chat.id
                    ? 'bg-white shadow-sm dark:bg-white'
                    : 'hover:bg-white/50 dark:hover:bg-white/50'
                }`}
                key={chat.id}
                onClick={() => handleSwitchToChat(chat.id)}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-black">
                    {chat.title}
                  </h3>
                  {chat.firstMessage && (
                    <p className="mt-1 line-clamp-1 text-gray-500 text-sm">
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
        <div className="relative border-gray-300 border-t p-6">
          <h2 className="mb-6 font-medium text-black text-xl">History</h2>

          <div className="max-h-60 space-y-4 overflow-y-auto">
            {historyChats.map((chat) => (
              <button
                className={`flex w-full items-start rounded-xl px-3 py-2 text-left transition-colors ${
                  currentChatId === chat.id
                    ? 'bg-white shadow-sm dark:bg-white'
                    : 'hover:bg-white/50 dark:hover:bg-white/50'
                }`}
                key={chat.id}
                onClick={() => handleSwitchToChat(chat.id)}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-black">
                    {chat.title}
                  </h3>
                  {chat.firstMessage && (
                    <p className="mt-1 line-clamp-1 text-gray-500 text-sm">
                      {chat.firstMessage}
                    </p>
                  )}
                  <div className="mt-1 text-gray-400 text-xs">
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
            aria-label="New Chat"
            className="absolute right-6 bottom-6 h-14 w-14"
            onClick={handleCreateNewChat}
            size="icon"
            variant="default"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatSwitcher;
