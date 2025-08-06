'use client';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// Import KaTeX CSS for math rendering
import 'katex/dist/katex.min.css';
// import { useChat } from "ai/react";
import { useChat } from '@ai-sdk/react';
import { BookOpenText } from '@phosphor-icons/react';
import { Check, Copy, ScanEye, X } from 'lucide-react';

import { v4 as uuidv4 } from 'uuid';
import ChatSwitcher from '~/components/ui/ChatSwitcher';
import MarkdownRenderer from '~/components/ui/MarkdownRenderer';
import SplitScreenLayout from '~/components/ui/SplitScreenLayout';
import SubmitButton from '~/components/ui/SubmitButton';
import Timeline from '~/components/ui/Timeline';

interface ChatInfo {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  firstMessage?: string;
}

// Update the Message interface to be compatible with UIMessage
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'data'; // Added "system" | "data"
  content: string;
  model?: string;
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          )
      );
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
};

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false); // New state to track token streaming
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [skipAutoScroll, setSkipAutoScroll] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenForMessageId, setRegenForMessageId] = useState<string | null>(
    null
  );
  console.log(regenForMessageId);
  // const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true);
  // const [showActivityBar, setShowActivityBar] = React.useState<Checked>(false);
  // const [showPanel, setShowPanel] = React.useState<Checked>(false);
  const [chatId, setChatId] = useState<string | undefined>(undefined);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);

  // New state for chat management
  const [showChatSwitcher, setShowChatSwitcher] = useState(false);
  const [savedChats, setSavedChats] = useState<ChatInfo[]>([]);
  // const [showActionButtons, setShowActionButtons] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  console.log(setHideTimeout);

  // const [isVoiceMode, setIsVoiceMode] = useState(false);
  // const [isFullScreenVoiceMode, setIsFullScreenVoiceMode] = useState(false);
  // const [isRecording, setIsRecording] = useState(false);
  // const [audioSrc, setAudioSrc] = useState<string | null>(null);
  // // const [isPlaying, setIsPlaying] = useState(false);
  // const [transcribedText, setTranscribedText] = useState("");
  // const audioRef = useRef<HTMLAudioElement | null>(null);
  // const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // const audioChunksRef = useRef<Blob[]>([]);

  // console.log(setAudioSrc);
  // console.log(setTranscribedText);

  // const [showDesktopOnlyModal, setShowDesktopOnlyModal] = useState(false);
  // console.log(showDesktopOnlyModal);
  const isMobile = useIsMobile();

  // Add state for timeline hover
  const [timelineHovered, setTimelineHovered] = useState(false);
  console.log(timelineHovered);
  // Track currently selected message in timeline
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  // Add credit limit error state
  const [showCreditLimitError, setShowCreditLimitError] = useState(false);

  // Get theme from next-themes instead
  // const { theme } = useTheme();

  // const handleMouseEnter = () => {
  //   if (hideTimeout) clearTimeout(hideTimeout);
  //   setShowActionButtons(true);
  // };

  // const handleMouseLeave = () => {
  //   const timeout = setTimeout(() => {
  //     setShowActionButtons(false);
  //   }, 1000); // 1000ms delay to give enough time to reach the buttons
  //   setHideTimeout(timeout);
  // };

  // Get the chat hook first before any code uses 'messages'
  const { messages, input, handleInputChange, handleSubmit, setInput } =
    useChat({
      api: '/api/chat',
      body: { model: 'google/gemma-3-27b-it:free' },
      id: chatId,
      initialMessages,
      onResponse: (response) => {
        // Remove the code that tries to read the response stream directly
        // This was causing the "ReadableStreamDefaultReader constructor" error

        // Only reset input if NOT using the deepseek model to prevent refresh loop
        console.log(response);
        // Since we're using google/gemma-3-27b-it:free, always reset input
        resetInputField();
        setError(null);
        setIsStreaming(true); // Start streaming state
        // Don't set isLoading to false here - keep it on during streaming

        if (isRegenerating) {
          setIsRegenerating(false);
          setRegenForMessageId(null);
        }
      },
      onFinish: () => {
        // Only set loading and streaming to false when completely finished
        setIsLoading(false);
        setIsStreaming(false);
      },
      onError: (error) => {
        console.error('Error:', error);
        setIsLoading(false);
        setIsStreaming(false);

        // Check for credit limit errors in the error message
        if (
          error.message?.includes('Rate limit exceeded') ||
          error.message?.includes('credits') ||
          error.message?.includes('429') ||
          error.message?.includes('CREDIT_LIMIT_EXCEEDED') ||
          (error.cause &&
            typeof error.cause === 'object' &&
            'message' in error.cause &&
            typeof (error.cause as { message: string }).message === 'string' &&
            ((error.cause as { message: string }).message.includes(
              'Rate limit exceeded'
            ) ||
              (error.cause as { message: string }).message.includes('credits')))
        ) {
          setShowCreditLimitError(true);
          setError(
            "You've reached your free usage limit for AI models today. Please try a different model or try again tomorrow."
          );
        }
        // Check for stream-related errors
        else if (
          error.message?.includes('ReadableStreamDefaultReader') ||
          error.message?.includes('locked to a reader') ||
          error.message?.includes('stream')
        ) {
          setError('A connection error occurred. Please try again.');
        }
        // Check for connection-related errors
        else if (
          error.message?.includes('Failed to connect') ||
          error.message?.includes('getaddrinfo ENOTFOUND') ||
          error.message?.includes('network') ||
          error.message?.includes('Network Error') ||
          error.message?.includes('Cannot connect') ||
          error.message?.includes('Failed after') ||
          (error.cause &&
            typeof error.cause === 'object' &&
            'message' in error.cause &&
            typeof (error.cause as { message: string }).message === 'string' &&
            (error.cause as { message: string }).message.includes(
              'fetch failed'
            )) ||
          !navigator.onLine
        ) {
          setError(
            'Internet connection lost. Please check your network and try again.'
          );
        } else {
          // Default fallback for unexpected errors - show high demand message
          setError('we are facing a high demand pls try again');
        }
      },
    });

  // Add a network status monitor
  useEffect(() => {
    const handleOnline = () => {
      setError(null);
    };

    const handleOffline = () => {
      setError(
        'Internet connection lost. Please check your network and try again.'
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Now we can use useEffect hooks that reference 'messages'
  useEffect(() => {
    const storedChatId = localStorage.getItem('currentChatId');

    if (storedChatId) {
      setChatId(storedChatId);

      try {
        // Explicitly get the messages for this chat ID
        const chatMessagesJson = localStorage.getItem(`chat_${storedChatId}`);

        // Only set messages if they exist as a proper array
        if (chatMessagesJson) {
          const parsedMessages = JSON.parse(chatMessagesJson);

          // Check if it's actually an array of messages
          if (Array.isArray(parsedMessages)) {
            setInitialMessages(parsedMessages);
          } else {
            console.warn(
              'Stored messages are not an array, setting empty messages'
            );
            setInitialMessages([]);
            // Fix the storage
            localStorage.setItem(`chat_${storedChatId}`, JSON.stringify([]));
          }
        } else {
          // No messages found for this chat ID, set empty array
          setInitialMessages([]);
          // Create the empty array in storage
          localStorage.setItem(`chat_${storedChatId}`, JSON.stringify([]));
        }
      } catch (err) {
        console.error('Failed to parse stored messages', err);
        setInitialMessages([]);
        // Reset to empty on error
        localStorage.setItem(`chat_${storedChatId}`, JSON.stringify([]));
      }
    } else {
      // No current chat ID, so create a new one
      const newChatId = uuidv4();
      localStorage.setItem('currentChatId', newChatId);
      localStorage.setItem(`chat_${newChatId}`, JSON.stringify([]));
      setChatId(newChatId);
      setInitialMessages([]);

      // Also create a new chat entry
      const newChat: ChatInfo = {
        id: newChatId,
        title: 'New Chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messageCount: 0,
      };

      const updatedChats = [...savedChats, newChat];
      setSavedChats(updatedChats);
      localStorage.setItem('savedChats', JSON.stringify(updatedChats));
    }

    // Load saved chat list
    const storedChats = localStorage.getItem('savedChats');
    if (storedChats) {
      try {
        setSavedChats(JSON.parse(storedChats));
      } catch (err) {
        console.error('Failed to parse saved chats', err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save current chat messages when they change
  useEffect(() => {
    if (chatId && messages.length > 0) {
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));

      // Update chat metadata
      updateChatMetadata(chatId, messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, chatId]);

  // Handle keyboard shortcuts for chat management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command+N or Ctrl+N for new chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        createNewChat();
      }

      // Command+K or Ctrl+K to open chat switcher
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowChatSwitcher(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to create a new chat
  const createNewChat = () => {
    // Generate new chat ID
    const newChatId = uuidv4();

    // IMPORTANT: Create empty message list FIRST before anything else
    localStorage.setItem(`chat_${newChatId}`, JSON.stringify([]));

    // Save current messages if needed (do this after setting the empty array)
    if (messages.length > 0 && chatId) {
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
    }

    // Add new chat to saved chats
    const newChat: ChatInfo = {
      id: newChatId,
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 0,
    };

    const updatedChats = [...savedChats, newChat];
    setSavedChats(updatedChats);
    localStorage.setItem('savedChats', JSON.stringify(updatedChats));

    // Set as current chat
    localStorage.setItem('currentChatId', newChatId);

    // Completely reset the application state by using replace instead of reload
    // This ensures a clean slate with no history
    window.location.replace(window.location.pathname);
  };

  // Function to switch to a different chat
  const switchToChat = (selectedChatId: string) => {
    // Save current messages first
    if (messages.length > 0 && chatId) {
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
    }

    // Set selected chat as current
    localStorage.setItem('currentChatId', selectedChatId);

    // Completely reset the application state using replace
    window.location.replace(window.location.pathname);
  };
  console.log(switchToChat);

  // Update chat metadata when messages change
  const updateChatMetadata = (id: string, chatMessages: typeof messages) => {
    // Find existing chat in saved chats
    const chatIndex = savedChats.findIndex((chat) => chat.id === id);

    if (chatIndex >= 0) {
      const updatedChats = [...savedChats];

      // Get title from first user message or keep existing title
      const firstUserMessage = chatMessages.find((msg) => msg.role === 'user');
      const title = firstUserMessage
        ? firstUserMessage.content.slice(0, 30) +
          (firstUserMessage.content.length > 30 ? '...' : '')
        : updatedChats[chatIndex]?.title || 'New Chat';

      // Ensure createdAt is preserved
      const existingChat = updatedChats[chatIndex];
      if (existingChat) {
        updatedChats[chatIndex] = {
          ...existingChat, // Spread existing properties first
          id: existingChat.id, // Explicitly include the id
          title,
          updatedAt: Date.now(),
          messageCount: chatMessages.length,
          firstMessage: firstUserMessage?.content || '',
          createdAt: existingChat.createdAt, // Ensure createdAt is always present
        };
      }

      setSavedChats(updatedChats);
      localStorage.setItem('savedChats', JSON.stringify(updatedChats));
    }
  };

  // Clear current chat with specific handling for local storage
  // const handleClearHistory = () => {
  //   if (chatId) {
  //     // Remove current chat from localStorage
  //     localStorage.removeItem(`chat_${chatId}`);
  //     // Update saved chats list
  //     const updatedChats = savedChats.filter((chat) => chat.id !== chatId);
  //     localStorage.setItem("savedChats", JSON.stringify(updatedChats));
  //     // Update current chat; if none, clear currentChatId
  //     if (updatedChats.length > 0) {
  //       const newCurrent = updatedChats.reduce((prev, cur) =>
  //         cur.updatedAt > prev.updatedAt ? cur : prev,
  //       );
  //       localStorage.setItem("currentChatId", newCurrent.id);
  //     } else {
  //       localStorage.removeItem("currentChatId");
  //     }
  //     // Reload the page to reflect changes
  //     window.location.reload();
  //   } else {
  //     localStorage.removeItem("chatMessages");
  //     localStorage.removeItem("chatId");
  //     window.location.reload();
  //   }
  // };

  // -----------------------------------------------------------------------
  // Chat hook configuration
  // -----------------------------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command+N or Ctrl+N for new chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        createNewChat();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowChatSwitcher(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (chatId && messages.length > 0) {
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));

      // Update chat metadata
      updateChatMetadata(chatId, messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, chatId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Replace the existing scroll effect with the following:
  useEffect(() => {
    if (!(skipAutoScroll || isStreaming)) {
      scrollToBottom();
    }
  }, [messages, isLoading, skipAutoScroll, isStreaming]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const resetInputField = () => {
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const copyMessage = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 10_000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // -----------------------------------------------------------------------
  // Form Submission Handler
  // -----------------------------------------------------------------------

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    setSkipAutoScroll(false);
    setIsLoading(true);
    setIsStreaming(false); // Reset streaming state at beginning
    setError(null);

    try {
      // Use the handleSubmit directly since we're in a submit handler
      handleSubmit(event);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsLoading(false);
      setIsStreaming(false); // Make sure to also reset streaming state on error
      setError('An error occurred. Please try again.');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void onSubmit(event);
    } else if (event.key === 'Enter' && event.shiftKey) {
      adjustTextareaHeight();
    }
  };

  const shareChat = async () => {
    try {
      const response = await fetch('/api/shared', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ messages }),
      });
      if (!response.ok) {
        throw new Error('Failed to share chat.');
      }
      const data = await response.json();
      const shareURL = `${window.location.origin}/ai/shared/${data.shareId}`;
      await navigator.clipboard.writeText(shareURL);
      alert(`Chat link copied to clipboard: ${shareURL}`);
    } catch (error) {
      console.error('Error sharing chat:', error);
      alert('Error sharing chat. Please try again later.');
    }
  };
  console.log(shareChat);

  useEffect(() => {
    return () => {
      if (hideTimeout) clearTimeout(hideTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideTimeout]);

  // const toggleActionButtons = () => {
  //   setShowActionButtons((prev) => !prev);
  // };
  // console.log(toggleActionButtons);

  // Add state for diagram panel
  const [diagramContent, setDiagramContent] = useState('');
  const [hasDiagramsAvailable, setHasDiagramsAvailable] = useState(false);
  const [activeDiagramMessageId, setActiveDiagramMessageId] = useState<
    string | null
  >(null);
  const [messageDiagrams, setMessageDiagrams] = useState<{
    [key: string]: string;
  }>({});

  // Debug useEffect to track messageDiagrams changes
  useEffect(() => {
    console.log('messageDiagrams updated:', messageDiagrams);
  }, [messageDiagrams]);

  // Handle diagram panel changes
  const handleDiagramsChange = useCallback(
    (hasDiagrams: boolean, content: string, messageId?: string) => {
      console.log('handleDiagramsChange called:', {
        hasDiagrams,
        messageId,
        contentLength: content?.length,
      });

      if (messageId && hasDiagrams && content) {
        console.log('Storing diagram for messageId:', messageId);

        // Check if we already have this exact diagram content
        if (messageDiagrams[messageId] === content) {
          console.log('Diagram content unchanged, skipping update');
          return;
        }

        // Store diagram content for this specific message
        setMessageDiagrams((prev) => {
          // Don't update if the content is the same
          if (prev[messageId] === content) {
            return prev;
          }

          const updated = {
            ...prev,
            [messageId]: content,
          };
          console.log('Updated messageDiagrams:', updated);
          return updated;
        });

        // Set as active diagram and show panel
        setActiveDiagramMessageId(messageId);
        setDiagramContent(content);
        setHasDiagramsAvailable(true);
      } else if (!hasDiagrams) {
        // No diagrams in this message
        console.log('No diagrams in message:', messageId);

        // Only update if we're actually changing the state
        if (hasDiagramsAvailable) {
          setHasDiagramsAvailable(false);
        }
      }
    },
    [messageDiagrams, hasDiagramsAvailable]
  );

  // Handle clicking on diagram indicator
  const handleDiagramClick = (messageId: string) => {
    console.log('Diagram click for messageId:', messageId);
    console.log('Available diagrams:', messageDiagrams);
    const diagramContent = messageDiagrams[messageId];
    if (diagramContent) {
      console.log('Setting active diagram:', messageId);
      setActiveDiagramMessageId(messageId);
      setDiagramContent(diagramContent);
      setHasDiagramsAvailable(true);
    } else {
      console.log('No diagram content found for messageId:', messageId);
    }
  };

  // Handle closing the diagram panel
  const handleCloseDiagramPanel = () => {
    setHasDiagramsAvailable(false);
    setActiveDiagramMessageId(null);
    setDiagramContent('');
  };

  // Create a reusable error display component function
  const ErrorDisplay = ({
    message,
    icon,
    actionText,
    onAction,
  }: {
    message: string;
    icon?: React.ReactNode;
    actionText?: string;
    onAction?: () => void;
  }) => (
    <div className="mt-2 rounded-lg border border-red-200 bg-red-100 p-3 text-center dark:border-red-800 dark:bg-red-900/30">
      <div className="flex items-center justify-center gap-2">
        {icon || (
          <svg
            className="h-5 w-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              fillRule="evenodd"
            />
          </svg>
        )}
        <span className="font-medium text-base text-red-600 dark:text-red-400">
          {message}
        </span>
      </div>

      {actionText && onAction && (
        <div className="mt-2 text-red-600 text-sm dark:text-red-400">
          <button
            className="underline hover:text-red-700 dark:hover:text-red-300"
            onClick={onAction}
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );

  // Add state for filtering chats
  const [searchQuery] = useState('');

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return savedChats;
    }

    const query = searchQuery.toLowerCase();
    return savedChats.filter(
      (chat) =>
        chat.title.toLowerCase().includes(query) ||
        (chat.firstMessage && chat.firstMessage.toLowerCase().includes(query))
    );
  }, [savedChats, searchQuery]);

  // Add a ref to store message elements by their ID
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Function to scroll to a specific message
  const scrollToMessage = useCallback(
    (messageId: string) => {
      if (messageRefs.current[messageId]) {
        messageRefs.current[messageId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        setCurrentMessageId(messageId);
      }
    },
    [setCurrentMessageId]
  );

  // Add QuestionMessage component for user questions - memoized to prevent re-renders during typing
  const QuestionMessage = React.memo(function QuestionMessage({
    content,
  }: {
    content: string;
  }) {
    const lines = content.split('\n');
    const isLong = lines.length > 3;
    const [expanded, setExpanded] = useState(false);
    const displayed =
      isLong && !expanded ? lines.slice(0, 3).join('\n') : content;

    return (
      <div
        className={`inline-block max-w-[95vw] overflow-hidden text-[#99C5CB] leading-tight sm:max-w-[85vw] md:max-w-3xl dark:text-[#99C5CB] ${expanded ? 'text-2xl' : 'text-3xl md:text-4xl'} tracking-tight `}
      >
        <MarkdownRenderer content={displayed} />
        {isLong && !expanded && (
          <span
            className="ml-2 cursor-pointer text-base text-blue-500"
            onClick={() => setExpanded(true)}
          >
            more..
          </span>
        )}
      </div>
    );
  });

  // Memoized message list to prevent re-renders during typing
  const MessageList = React.memo(function MessageList({
    messages,
    messageRefs,
    copiedMessageId,
    copyMessage,
    isMobile,
    handleDiagramsChange,
    QuestionMessage,
    messageDiagrams,
    handleDiagramClick,
    activeDiagramMessageId,
  }: {
    messages: Message[];
    messageRefs: React.MutableRefObject<{
      [key: string]: HTMLDivElement | null;
    }>;
    copiedMessageId: string | null;
    copyMessage: (content: string, messageId: string) => void;
    isMobile: boolean;
    handleDiagramsChange: (
      hasDiagrams: boolean,
      diagramContent: string,
      messageId?: string
    ) => void;
    QuestionMessage: React.ComponentType<{ content: string }>;
    messageDiagrams: { [key: string]: string };
    handleDiagramClick: (messageId: string) => void;
    activeDiagramMessageId: string | null;
  }) {
    return (
      <>
        {messages.map((m, index) => {
          const previousUserMessage =
            m.role === 'assistant' &&
            index > 0 &&
            messages[index - 1]?.role === 'user'
              ? (messages[index - 1]?.content ?? '')
              : '';
          console.log(previousUserMessage);
          return m.role === 'user' ? (
            <div
              className="group relative mx-2 flex animate-slide-in flex-col p-2 md:mx-0"
              data-oid="h9:.sd3" // Fix ref callback to not return a value
              key={m.id}
              ref={(el) => {
                messageRefs.current[m.id] = el;
              }}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <>
                {/* user question */}
                <div className="flex justify-start " data-oid="zgnwoog">
                  <QuestionMessage content={m.content} data-oid="4a3-5gr" />
                </div>
              </>
              <div className="mt-1 flex justify-start opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  className="rounded-full p-1 text-[#000000] hover:bg-[#646464] hover:text-[#48AAFF] dark:text-white"
                  data-oid="efva4nq"
                  onClick={() => copyMessage(m.content, m.id)}
                >
                  {copiedMessageId === m.id ? (
                    <Check className="h-5 w-5" data-oid="pzynuvl" />
                  ) : (
                    <Copy className="h-5 w-5" data-oid="zvtke.l" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div
              className="group relative flex animate-slide-in flex-col md:mx-0"
              key={m.id}
            >
              {/* answers*/}
              <div className="relative max-w-[95vw] overflow-x-hidden rounded-xl text-[#99C5CB]/50 text-[1.1rem] tracking-tight sm:max-w-[90vw] sm:text-[1.2rem] md:max-w-2xl md:p-2 md:text-[1.4rem] dark:text-[#99C5CB]/50 ">
                <div className="w-full cursor-pointer flex-col justify-start gap-4 ">
                  <div className="flex items-center text-[#000000] transition-colors sm:p-3 dark:text-[#99C5CB] ">
                    <button className="flex gap-2 text-base md:text-lg">
                      <BookOpenText className="h-8 w-8" data-oid="-7rk6d." />

                      <p>Response</p>
                    </button>
                  </div>

                  <div className="flex w-full cursor-pointer justify-start gap-4 border-[#484848] border-t-[1px] "></div>
                </div>

                <div className="flex animate-fade-in transition-opacity duration-500">
                  <SplitScreenLayout
                    content={m.content}
                    isMobile={isMobile}
                    messageId={m.id}
                    onDiagramsChange={handleDiagramsChange}
                  />
                </div>

                {/* Diagram indicator - appears after the response */}
                {messageDiagrams[m.id] && (
                  <div className="mt-4 flex justify-start">
                    <button
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all duration-200 ${
                        activeDiagramMessageId === m.id
                          ? 'border-blue-400/30 bg-[#5C767B] text-[#242D33]'
                          : 'border border-gray-400/20 bg-[#5C767B] text-[#242D33] hover:bg-gray-500/20 hover:text-gray-300'
                      }`}
                      onClick={() => {
                        console.log('Button clicked for messageId:', m.id);
                        handleDiagramClick(m.id);
                      }}
                    >
                      <ScanEye />
                      {activeDiagramMessageId === m.id
                        ? 'Viewing Diagram'
                        : 'View Diagram'}
                    </button>
                  </div>
                )}

                {/* Message action buttons... */}
                <div className="mb-14 flex flex-wrap gap-1 sm:gap-2">
                  <div className="flex items-center justify-center rounded-full p-2 text-[#000000] transition-colors hover:bg-[#e0e0e0] hover:text-[#48AAFF] sm:p-3 dark:text-white dark:hover:bg-[#294A6D] dark:hover:text-[#48AAFF]">
                    <button
                      className="text-base md:text-lg"
                      onClick={() => copyMessage(m.content, m.id)}
                    >
                      {copiedMessageId === m.id ? (
                        <Check className="h-5 w-5 text-[#48AAFF]" />
                      ) : (
                        <Copy
                          className="h-5 w-5 text-[#000000] hover:text-[#48AAFF] dark:text-[#f7eee3]"
                          data-oid="gp4p:1y"
                        />
                      )}
                    </button>
                  </div>

                  <div
                    className="h-[1px] w-full bg-[#484848]"
                    data-oid="0pqkos0"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  });

  return (
    <div className="h-[100svh] w-[100svw] rounded-lg bg-[#CCF9FF] p-1 ">
      <main className=" h-full rounded-lg bg-[#242D31] text-base transition-all duration-300">
        {/* Main Content Area */}
        <div
          className={`transition-all duration-300 ${
            !isMobile &&
            hasDiagramsAvailable &&
            (timelineHovered || activeDiagramMessageId)
              ? 'mr-[30rem]'
              : 'mr-0'
          } px-4 lg:px-6`}
        >
          {/* Add Timeline component */}
          {messages.length > 0 && (
            <Timeline
              currentMessageId={currentMessageId}
              isMobile={isMobile}
              messages={messages}
              onHoverChange={setTimelineHovered}
              onMessageClick={scrollToMessage}
            />
          )}

          {messages.length === 0 ? (
            <div className="flex h-[calc(100vh-56px)] flex-col items-center justify-center px-4 ">
              <div className="flex flex-col items-center justify-center gap-2 p-4">
                <svg
                  fill="none"
                  height="43"
                  viewBox="0 0 211 43"
                  width="211"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g
                    data-figma-trr="r6u2.5-0f"
                    fill="none"
                    id="Repeat_group_1_inner"
                    stroke="#99C5CB"
                    strokeLinecap="round"
                    strokeWidth="0.781686"
                  >
                    <path d="M18.8803 10.7699L18.75 0.738281" />
                    <path d="M17.1911 2.94756L16.6808 2.47366C16.1806 2.00923 15.3672 2.36394 15.3672 3.04648V7.75304C15.3672 8.00743 15.491 8.24591 15.699 8.39231L18.4263 10.3115C18.7004 10.5044 19.0668 10.5011 19.3374 10.3034L21.9516 8.39299C22.153 8.24581 22.2721 8.01133 22.2721 7.76187V2.96577C22.2721 2.29592 21.4846 1.93636 20.9784 2.37506L20.3179 2.94756" />
                    <path d="M13.5391 2.55859V9.62383C13.5391 10.3987 14.1672 11.0269 14.9421 11.0269H18.7503H22.5585C23.3334 11.0269 23.9615 10.3987 23.9615 9.62383V2.55859" />
                  </g>

                  <use
                    href="#Repeat_group_1_inner"
                    transform="translate(25.6138 -6.8632) rotate(60)"
                  />
                  <use
                    href="#Repeat_group_1_inner"
                    transform="translate(44.3644 11.8874) rotate(120)"
                  />
                  <use
                    href="#Repeat_group_1_inner"
                    transform="translate(37.5012 37.5012) rotate(-180)"
                  />
                  <use
                    href="#Repeat_group_1_inner"
                    transform="translate(11.8874 44.3644) rotate(-120)"
                  />
                  <use
                    href="#Repeat_group_1_inner"
                    transform="translate(-6.8632 25.6138) rotate(-60)"
                  />

                  <path
                    d="M41.0362 32.75L41.0545 6.47519H44.9227V22.532L52.6592 13.0439H57.5127L49.3384 22.8969L58.3521 32.75H53.1701L44.9227 23.2619V32.75H41.0362ZM71.833 32.75V23.0612C71.833 22.2948 71.7661 21.5102 71.6323 20.7074C71.5107 19.8924 71.2674 19.1382 70.9025 18.4448C70.5497 17.7515 70.0449 17.1919 69.388 16.7662C68.7433 16.3404 67.8979 16.1275 66.8518 16.1275C66.1706 16.1275 65.5259 16.2431 64.9176 16.4742C64.3094 16.6932 63.7742 17.052 63.312 17.5508C62.8619 18.0495 62.503 18.7064 62.2354 19.5214C61.98 20.3364 61.8523 21.3278 61.8523 22.4955L59.4802 21.6015C59.4802 19.8133 59.8147 18.238 60.4838 16.8756C61.1528 15.5011 62.1138 14.4306 63.3667 13.6643C64.6196 12.8979 66.1341 12.5147 67.9101 12.5147C69.2725 12.5147 70.4159 12.7337 71.3404 13.1716C72.2649 13.6095 73.013 14.1873 73.5847 14.905C74.1686 15.6106 74.6126 16.383 74.9167 17.2223C75.2208 18.0617 75.4276 18.8827 75.537 19.6856C75.6465 20.4884 75.7013 21.1939 75.7013 21.8022V32.75H71.833ZM57.984 32.75V13.0439H61.3961V18.7368H61.8523V32.75H57.984ZM86.5724 33.2974C84.6018 33.2974 82.8927 32.8534 81.4452 31.9654C79.9976 31.0774 78.8785 29.8549 78.0878 28.2979C77.3093 26.7287 76.9201 24.9223 76.9201 22.8787C76.9201 20.8229 77.3215 19.0165 78.1243 17.4595C78.9272 15.8903 80.0524 14.6739 81.4999 13.8102C82.9475 12.9344 84.6383 12.4965 86.5724 12.4965C88.543 12.4965 90.2521 12.9405 91.6996 13.8285C93.1472 14.7165 94.2663 15.939 95.057 17.496C95.8477 19.053 96.243 20.8473 96.243 22.8787C96.243 24.9345 95.8416 26.7469 95.0387 28.3161C94.2481 29.8732 93.1289 31.0957 91.6814 31.9837C90.2339 32.8595 88.5309 33.2974 86.5724 33.2974ZM86.5724 29.7029C88.4579 29.7029 89.8628 29.0703 90.7873 27.8052C91.724 26.528 92.1923 24.8858 92.1923 22.8787C92.1923 20.8229 91.7179 19.1808 90.7691 17.9522C89.8324 16.7114 88.4335 16.091 86.5724 16.091C85.2952 16.091 84.243 16.383 83.4158 16.9669C82.5886 17.5386 81.9743 18.3353 81.5729 19.3571C81.1715 20.3668 80.9708 21.5406 80.9708 22.8787C80.9708 24.9466 81.4452 26.601 82.394 27.8417C83.3428 29.0825 84.7356 29.7029 86.5724 29.7029ZM101.547 32.75L95.5257 13.0256L99.3027 13.0439L103.426 26.5645L107.587 13.0439H110.871L115.031 26.5645L119.155 13.0439H122.914L116.892 32.75H113.827L109.229 18.4813L104.612 32.75H101.547ZM124.356 32.75V5.9278H128.17V32.75H124.356ZM140.2 33.2974C138.241 33.2974 136.52 32.8716 135.036 32.0201C133.564 31.1565 132.415 29.9583 131.587 28.4256C130.772 26.8807 130.365 25.0926 130.365 23.0612C130.365 20.9081 130.766 19.0409 131.569 17.4595C132.384 15.8782 133.515 14.6557 134.963 13.792C136.411 12.9283 138.095 12.4965 140.017 12.4965C142.024 12.4965 143.733 12.9648 145.144 13.9015C146.556 14.826 147.608 16.1458 148.301 17.8609C149.007 19.5761 149.286 21.6136 149.14 23.9735H145.327V22.5868C145.303 20.2999 144.865 18.609 144.013 17.5143C143.174 16.4195 141.891 15.8721 140.163 15.8721C138.253 15.8721 136.818 16.4742 135.857 17.6785C134.896 18.8827 134.416 20.6222 134.416 22.8969C134.416 25.0622 134.896 26.7409 135.857 27.933C136.818 29.1129 138.205 29.7029 140.017 29.7029C141.209 29.7029 142.237 29.4352 143.101 28.9C143.977 28.3526 144.658 27.5741 145.144 26.5645L148.885 27.7505C148.119 29.5143 146.957 30.8828 145.4 31.8559C143.843 32.8169 142.109 33.2974 140.2 33.2974ZM133.175 23.9735V20.9993H147.243V23.9735H133.175ZM158.872 33.2974C157.036 33.2974 155.448 32.8412 154.11 31.9289C152.784 31.0166 151.756 29.7758 151.026 28.2066C150.309 26.6253 149.95 24.8493 149.95 22.8787C149.95 20.8959 150.315 19.126 151.045 17.569C151.774 15.9998 152.808 14.7651 154.147 13.865C155.497 12.9527 157.096 12.4965 158.945 12.4965C160.806 12.4965 162.37 12.9527 163.635 13.865C164.912 14.7651 165.873 15.9998 166.518 17.569C167.174 19.1382 167.503 20.9081 167.503 22.8787C167.503 24.8493 167.174 26.6192 166.518 28.1884C165.861 29.7576 164.894 31.0044 163.616 31.9289C162.339 32.8412 160.758 33.2974 158.872 33.2974ZM159.401 29.8488C160.654 29.8488 161.676 29.5508 162.467 28.9547C163.258 28.3587 163.835 27.5376 164.2 26.4915C164.565 25.4454 164.748 24.2411 164.748 22.8787C164.748 21.5163 164.559 20.312 164.182 19.2659C163.817 18.2198 163.245 17.4048 162.467 16.8209C161.701 16.237 160.721 15.9451 159.529 15.9451C158.264 15.9451 157.224 16.2553 156.409 16.8756C155.594 17.496 154.986 18.3293 154.584 19.3754C154.195 20.4215 154.001 21.5893 154.001 22.8787C154.001 24.1803 154.195 25.3602 154.584 26.4185C154.986 27.4646 155.582 28.2979 156.373 28.9183C157.175 29.5386 158.185 29.8488 159.401 29.8488ZM164.748 32.75V18.5726H164.31V6.47519H168.141V32.75H164.748ZM179.177 42.0557C178.119 42.0557 177.091 41.8914 176.093 41.563C175.108 41.2346 174.208 40.748 173.393 40.1033C172.578 39.4708 171.903 38.6862 171.367 37.7495L174.889 35.9614C175.315 36.8007 175.923 37.415 176.714 37.8043C177.504 38.1935 178.338 38.3881 179.213 38.3881C180.296 38.3881 181.22 38.1935 181.987 37.8043C182.753 37.4272 183.331 36.8554 183.72 36.0891C184.122 35.3227 184.316 34.3739 184.304 33.2427V27.7322H184.76V13.0439H188.136V33.2791C188.136 33.8022 188.118 34.3009 188.081 34.7754C188.045 35.2498 187.978 35.7242 187.88 36.1986C187.601 37.5245 187.065 38.6193 186.275 39.4829C185.496 40.3466 184.499 40.9913 183.282 41.417C182.078 41.8428 180.71 42.0557 179.177 42.0557ZM178.885 33.2974C177.048 33.2974 175.461 32.8412 174.123 31.9289C172.797 31.0166 171.769 29.7758 171.039 28.2066C170.321 26.6253 169.962 24.8493 169.962 22.8787C169.962 20.8959 170.327 19.126 171.057 17.569C171.787 15.9998 172.821 14.7651 174.159 13.865C175.509 12.9527 177.109 12.4965 178.958 12.4965C180.819 12.4965 182.382 12.9527 183.647 13.865C184.924 14.7651 185.885 15.9998 186.53 17.569C187.187 19.1382 187.515 20.9081 187.515 22.8787C187.515 24.8493 187.187 26.6192 186.53 28.1884C185.873 29.7576 184.906 31.0044 183.629 31.9289C182.352 32.8412 180.77 33.2974 178.885 33.2974ZM179.414 29.8488C180.667 29.8488 181.689 29.5508 182.479 28.9547C183.27 28.3587 183.848 27.5376 184.213 26.4915C184.578 25.4454 184.76 24.2411 184.76 22.8787C184.76 21.5163 184.572 20.312 184.195 19.2659C183.83 18.2198 183.258 17.4048 182.479 16.8209C181.713 16.237 180.734 15.9451 179.542 15.9451C178.277 15.9451 177.237 16.2553 176.422 16.8756C175.607 17.496 174.998 18.3293 174.597 19.3754C174.208 20.4215 174.013 21.5893 174.013 22.8787C174.013 24.1803 174.208 25.3602 174.597 26.4185C174.998 27.4646 175.594 28.2979 176.385 28.9183C177.188 29.5386 178.198 29.8488 179.414 29.8488ZM199.81 33.2974C197.851 33.2974 196.13 32.8716 194.646 32.0201C193.174 31.1565 192.025 29.9583 191.198 28.4256C190.383 26.8807 189.975 25.0926 189.975 23.0612C189.975 20.9081 190.376 19.0409 191.179 17.4595C191.994 15.8782 193.126 14.6557 194.573 13.792C196.021 12.9283 197.705 12.4965 199.627 12.4965C201.634 12.4965 203.344 12.9648 204.755 13.9015C206.166 14.826 207.218 16.1458 207.911 17.8609C208.617 19.5761 208.897 21.6136 208.751 23.9735H204.937V22.5868C204.913 20.2999 204.475 18.609 203.623 17.5143C202.784 16.4195 201.501 15.8721 199.773 15.8721C197.864 15.8721 196.428 16.4742 195.467 17.6785C194.506 18.8827 194.026 20.6222 194.026 22.8969C194.026 25.0622 194.506 26.7409 195.467 27.933C196.428 29.1129 197.815 29.7029 199.627 29.7029C200.819 29.7029 201.847 29.4352 202.711 28.9C203.587 28.3526 204.268 27.5741 204.755 26.5645L208.495 27.7505C207.729 29.5143 206.567 30.8828 205.01 31.8559C203.453 32.8169 201.72 33.2974 199.81 33.2974ZM192.785 23.9735V20.9993H206.853V23.9735H192.785Z"
                    fill="#99C5CB"
                  />
                </svg>
              </div>

              <div className="w-full max-w-2xl px-4">
                <form className="w-full" onSubmit={onSubmit}>
                  <div className="group w-full flex-col items-center rounded-2xl border-2 border-[#44595D] bg-[#f0f0f0] p-1 shadow-lg transition-all duration-300 dark:bg-[#0C1114]">
                    <div className="relative flex flex-1 items-center overflow-hidden rounded-xl border border-[#44595d7c] bg-[#ffffff] py-3 transition-all duration-300 sm:py-5 dark:bg-[#121719]">
                      <textarea
                        className="max-h-[120px] min-h-[60px] flex-1 resize-none bg-transparent px-4 py-2 font-serif text-[#546C70] text-base outline-none transition-all duration-200 placeholder:text-[#546C70] md:text-lg dark:text-[#546C70] dark:placeholder:text-[#546C70] "
                        onChange={(e) => {
                          handleInputChange(e);
                          adjustTextareaHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        ref={textareaRef}
                        rows={1}
                        value={input}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-1 p-1 ">
                      <SubmitButton
                        isLoading={isLoading}
                        isStreaming={isStreaming}
                        type="submit"
                      />
                    </div>
                  </div>
                  {input.length > 0 && (
                    <div
                      className="mt-1.5 flex items-center justify-between px-1 text-[#99C5CB] text-xs dark:text-[#99C5CB]"
                      data-oid="lo5x-5-"
                    >
                      <span data-oid="rq6l398">
                        Press Enter to send, Shift + Enter for new line
                      </span>
                      <span data-oid="bi6ykkm">{input.length}</span>
                    </div>
                  )}
                  {error && (
                    <ErrorDisplay
                      actionText={
                        error.includes('Internet connection')
                          ? 'Reload page'
                          : undefined
                      }
                      data-oid="3_:w5hq"
                      icon={
                        error.includes('Internet connection') ? (
                          <svg
                            className="h-5 w-5 text-red-500"
                            data-oid="3q89qoh"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              clipRule="evenodd"
                              d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a 1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                              data-oid="m5uc0fn"
                              fillRule="evenodd"
                            />

                            <path
                              d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"
                              data-oid="d.ll2hs"
                            />
                          </svg>
                        ) : undefined
                      }
                      message={error}
                      onAction={
                        error.includes('Internet connection')
                          ? () => window.location.reload()
                          : undefined
                      }
                    />
                  )}
                </form>
              </div>
            </div>
          ) : (
            <div
              className={
                'relative mx-auto flex h-[calc(100vh-56px)] w-full flex-col p-2 transition-all duration-300 md:w-2/3'
              }
              data-oid="l_est0k"
            >
              <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 pb-24 sm:px-3 md:space-y-6 md:px-0 md:py-6">
                <MessageList
                  activeDiagramMessageId={activeDiagramMessageId}
                  copiedMessageId={copiedMessageId}
                  copyMessage={copyMessage}
                  handleDiagramClick={handleDiagramClick}
                  handleDiagramsChange={handleDiagramsChange}
                  isMobile={isMobile}
                  messageDiagrams={messageDiagrams}
                  messageRefs={messageRefs}
                  messages={messages}
                  QuestionMessage={QuestionMessage}
                />
                <div data-oid="xsdo_32" ref={messagesEndRef} />
              </div>

              {/* Bottom input or toolbar area */}
              <div
                className={
                  'sticky right-0 bottom-0 left-0 z-10 flex flex-row items-center justify-center gap-3 bg-gradient-to-b from-[var(--background)] via-[var(--background)/80] to-transparent p-2 transition-all duration-300 sm:p-4'
                }
                data-oid="2j:l2q7"
              >
                {/* ...existing input field form... */}
                <form
                  className={'mx-auto w-full max-w-2xl px-2 sm:px-3 md:px-0'}
                  data-oid="8tx03ya"
                  onSubmit={onSubmit}
                >
                  <div className="group w-full flex-col items-center rounded-2xl border-2 border-[#44595D] bg-[#f0f0f0] p-1 shadow-lg transition-all duration-300 dark:bg-[#0C1114]">
                    <div className="relative flex flex-1 items-center overflow-hidden rounded-xl border border-[#44595d7c] bg-[#ffffff] py-3 transition-all duration-300 sm:py-5 dark:bg-[#121719]">
                      <textarea
                        className="max-h-[120px] min-h-[60px] flex-1 resize-none bg-transparent px-4 py-2 font-serif text-[#546C70] text-base outline-none transition-all duration-200 placeholder:text-[#546C70] md:text-lg dark:text-[#546C70] dark:placeholder:text-[#546C70] "
                        onChange={(e) => {
                          handleInputChange(e);
                          adjustTextareaHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        ref={textareaRef}
                        rows={1}
                        value={input}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-1 p-1 ">
                      <SubmitButton
                        isLoading={isLoading}
                        isStreaming={isStreaming}
                        type="submit"
                      />
                    </div>
                  </div>

                  {input.length > 0 && (
                    <div className="mt-1.5 flex items-center justify-between px-1 text-[#555555] text-xs dark:text-[#f7eee380]">
                      <span>
                        Press Enter to send, Shift + Enter for new line
                      </span>
                      <span data-oid="cyafi.h">{input.length}</span>
                    </div>
                  )}

                  {error && (
                    <ErrorDisplay
                      actionText={
                        error.includes('Internet connection')
                          ? 'Reload page'
                          : undefined
                      }
                      data-oid="x6_7ny_"
                      icon={
                        error.includes('Internet connection') ? (
                          <svg
                            className="h-5 w-5 text-red-500"
                            data-oid="1-hv8:."
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              clipRule="evenodd"
                              d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a 1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                              data-oid="lh.:33h"
                              fillRule="evenodd"
                            />

                            <path
                              d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"
                              data-oid="-8ysrry"
                            />
                          </svg>
                        ) : undefined
                      }
                      message={error}
                      onAction={
                        error.includes('Internet connection')
                          ? () => window.location.reload()
                          : undefined
                      }
                    />
                  )}
                </form>
              </div>
            </div>
          )}

          {/* Chat Switcher Modal */}
          <ChatSwitcher
            currentChatId={chatId}
            filteredChats={filteredChats}
            isOpen={showChatSwitcher}
            onClose={() => setShowChatSwitcher(false)}
            onCreateNewChat={createNewChat}
            onSwitchToChat={switchToChat}
          />

          {/* Add this right after the existing error notification */}
          {showCreditLimitError && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              data-oid="vc1jlj8"
            >
              <div
                className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-[#1a1a1a]"
                data-oid="zxgnm10"
              >
                <div
                  className="mb-4 flex items-center justify-between"
                  data-oid="wchlo8."
                >
                  <h2
                    className="font-bold text-black text-xl dark:text-white"
                    data-oid="28k1og8"
                  >
                    Credit Limit Reached
                  </h2>
                  <button
                    className="rounded-full p-1 text-gray-500 hover:bg-gray-200 dark:text-gray-400 hover:dark:bg-gray-800"
                    data-oid="a_8p3qb"
                    onClick={() => setShowCreditLimitError(false)}
                  >
                    <X className="h-5 w-5" data-oid="rzw8.a1" />
                  </button>
                </div>
                <div
                  className="mb-6 text-gray-800 dark:text-gray-200"
                  data-oid="4kywl0g"
                >
                  <p className="mb-3" data-oid="0oh6cah">
                    You&apos;ve reached your free usage limit for the selected
                    AI model today.
                  </p>
                  <p data-oid="gbikx13">Please try one of these options:</p>
                  <ul
                    className="mt-2 ml-5 list-disc space-y-1"
                    data-oid="boc_mk1"
                  >
                    <li data-oid="3j1y549">Switch to a different AI model</li>
                    <li data-oid="pf5h.1c">
                      Try again tomorrow when your limits reset
                    </li>
                  </ul>
                </div>
                <div className="flex justify-between" data-oid="_.1ie-y">
                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    data-oid="lqze5i."
                    onClick={() => {
                      setShowCreditLimitError(false);
                    }}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Diagram Toggle Button (when panel is closed but diagrams are available) */}
        {!(isMobile || hasDiagramsAvailable) &&
          Object.keys(messageDiagrams).length > 0 && (
            <button
              className="group fixed right-4 bottom-4 z-20 rounded-full border border-blue-400/50 bg-blue-500/95 p-3 text-white shadow-2xl backdrop-blur-xl transition-all duration-200 hover:scale-105 hover:bg-blue-600/95"
              onClick={() => {
                const lastMessageId =
                  Object.keys(messageDiagrams)[
                    Object.keys(messageDiagrams).length - 1
                  ];
                if (lastMessageId) {
                  handleDiagramClick(lastMessageId);
                }
              }}
              title="View available diagrams"
            >
              <svg
                className="h-5 w-5 transition-transform group-hover:rotate-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              {Object.keys(messageDiagrams).length > 1 && (
                <div className="-top-2 -right-2 absolute flex h-5 w-5 items-center justify-center rounded-full bg-red-500 font-bold text-white text-xs">
                  {Object.keys(messageDiagrams).length}
                </div>
              )}
            </button>
          )}

        {/* Floating Right Diagram Panel */}
        {!isMobile && hasDiagramsAvailable && diagramContent && (
          <div className="slide-in-from-right-5 fixed top-4 right-4 z-20 h-[95svh] w-[30rem] animate-in overflow-hidden rounded-2xl border-4 border-gray-200/50 bg-white/95 shadow-2xl backdrop-blur-xl duration-300 dark:border-[#42595d6e] dark:bg-[#121719]">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 ">
                <div className="flex items-center gap-2 font-semibold text-gray-800 text-lg dark:text-gray-200">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-white">
                    📊
                  </div>
                  Diagrams
                </div>
                <button
                  className="rounded-full p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={handleCloseDiagramPanel}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 text-red-400">
                <MarkdownRenderer
                  content={diagramContent}
                  onlyDiagrams={true}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
