import { useState, useEffect, useRef, useCallback } from 'react';
import type { Message, ChatSession, BackendStatus, AppSettings, Toast } from './types/chat';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WelcomeHero } from './components/WelcomeHero';
import { MessageItem } from './components/MessageItem';
import { TypingIndicator } from './components/TypingIndicator';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { ToastContainer } from './components/ToastContainer';
import { playAudioChime } from './utils/audio';

const STORAGE_KEYS = {
  SESSIONS: 'nova_chat_sessions',
  ACTIVE_SESSION: 'nova_active_session',
  SETTINGS: 'nova_app_settings',
  SIDEBAR_OPEN: 'nova_sidebar_open',
};

function formatTimestamp(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Initial conversations matching the reference UI mockup
const INITIAL_DEMO_SESSIONS: ChatSession[] = [
  {
    id: 'session-demo-1',
    title: 'How does AI work?',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'How does AI work?',
        timestamp: '10:24 AM',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `AI (Artificial Intelligence) works by using machine learning, which allows computers to learn from data, find patterns, and make decisions or predictions without being explicitly programmed.

Here's a simple breakdown:
1. **Data** – The model is trained on large amounts of data.
2. **Learning** – It finds patterns using algorithms (like neural networks).
3. **Prediction** – It uses what it learned to make decisions or generate responses.

Would you like a more detailed explanation or an example?`,
        timestamp: '10:24 AM',
      },
    ],
  },
  {
    id: 'session-demo-2',
    title: 'Python code example',
    createdAt: Date.now() - 1000 * 60 * 72,
    updatedAt: Date.now() - 1000 * 60 * 72,
    messages: [
      {
        id: 'msg-2-1',
        role: 'user',
        content: 'Give me a Python code example for reading a JSON file.',
        timestamp: '09:12 AM',
      },
      {
        id: 'msg-2-2',
        role: 'assistant',
        content: `Here is a clean Python example using the built-in \`json\` module:

\`\`\`python
import json

def load_data(filepath: str) -> dict:
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

# Example usage
data = load_data('config.json')
print("Loaded:", data)
\`\`\`

Let me know if you would like error handling or async file I/O!`,
        timestamp: '09:13 AM',
      },
    ],
  },
  {
    id: 'session-demo-3',
    title: 'Project planning tips',
    createdAt: Date.now() - 1000 * 60 * 60 * 21,
    updatedAt: Date.now() - 1000 * 60 * 60 * 21,
    messages: [
      {
        id: 'msg-3-1',
        role: 'user',
        content: 'What are the top 3 project planning tips?',
        timestamp: '04:36 PM',
      },
      {
        id: 'msg-3-2',
        role: 'assistant',
        content: `Top 3 Agile project planning tips:
1. **Define clear acceptance criteria:** Eliminate ambiguity before writing code.
2. **Break tasks into micro-deliverables:** Keep pull requests concise and reviewable.
3. **Set realistic buffer periods:** Account for code reviews, CI/CD, and regression testing.`,
        timestamp: '04:37 PM',
      },
    ],
  },
  {
    id: 'session-demo-4',
    title: 'Explain machine learning',
    createdAt: Date.now() - 1000 * 60 * 60 * 23,
    updatedAt: Date.now() - 1000 * 60 * 60 * 23,
    messages: [],
  },
  {
    id: 'session-demo-5',
    title: 'Travel recommendations',
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    updatedAt: Date.now() - 1000 * 60 * 60 * 48,
    messages: [],
  },
  {
    id: 'session-demo-6',
    title: 'Healthy diet suggestions',
    createdAt: Date.now() - 1000 * 60 * 60 * 96,
    updatedAt: Date.now() - 1000 * 60 * 60 * 96,
    messages: [],
  },
  {
    id: 'session-demo-7',
    title: 'Web development help',
    createdAt: Date.now() - 1000 * 60 * 60 * 144,
    updatedAt: Date.now() - 1000 * 60 * 60 * 144,
    messages: [],
  },
];

export default function App() {
  const defaultBackendUrl =
    (import.meta.env.VITE_BACKEND_URL as string | undefined) ||
    'http://localhost:5001';

  // Application Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      backendUrl: defaultBackendUrl,
      persistChat: true,
      soundEnabled: true,
      userName: 'John Doe',
      userEmail: 'john@example.com',
    };
  });

  // Chat Sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_DEMO_SESSIONS;
  });

  // Active Session ID
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const savedActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (savedActive && sessions.some((s) => s.id === savedActive)) {
      return savedActive;
    }
    return sessions[0]?.id || 'session-demo-1';
  });

  // Sidebar Open State
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_OPEN);
    return saved !== 'false';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('connecting');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const chatViewportRef = useRef<HTMLDivElement>(null);

  // Active Session Object
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  // Toast Dispatcher
  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: Toast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auto-scroll chat to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    if (chatViewportRef.current) {
      chatViewportRef.current.scrollTo({
        top: chatViewportRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  // Save Sessions & Active ID to LocalStorage
  useEffect(() => {
    if (settings.persistChat) {
      try {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, activeSessionId);
      } catch {}
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    }
  }, [sessions, activeSessionId, settings.persistChat]);

  // Save Settings to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Save Sidebar Open State
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_OPEN, String(isSidebarOpen));
  }, [isSidebarOpen]);

  // Scroll whenever messages or loading state changes
  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isLoading, scrollToBottom]);

  // Backend Health Polling
  const checkBackendHealth = useCallback(
    async (url: string, isInitialProbe = false): Promise<boolean> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const response = await fetch(`${url}/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          setBackendStatus('online');
          return true;
        }
        throw new Error('Non-200');
      } catch {
        if (isInitialProbe && url === 'http://localhost:5000') {
          try {
            const fallbackRes = await fetch('http://localhost:5000/health');
            if (fallbackRes.ok) {
              setSettings((prev) => ({ ...prev, backendUrl: 'http://localhost:5000' }));
              setBackendStatus('online');
              return true;
            }
          } catch {}
        }
        setBackendStatus('offline');
        return false;
      }
    },
    []
  );

  useEffect(() => {
    checkBackendHealth(settings.backendUrl, true);
    const interval = setInterval(() => {
      checkBackendHealth(settings.backendUrl, false);
    }, 8000);
    return () => clearInterval(interval);
  }, [checkBackendHealth, settings.backendUrl]);

  // Create New Chat Session
  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    showToast('Started a new conversation', 'info');
  };

  // Select Chat Session
  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    if (window.innerWidth < 900) {
      setIsSidebarOpen(false);
    }
  };

  // Delete Chat Session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const sessionToDelete = sessions.find((s) => s.id === id);
    if (!sessionToDelete) return;

    if (window.confirm(`Delete conversation "${sessionToDelete.title}"?`)) {
      const remaining = sessions.filter((s) => s.id !== id);

      if (remaining.length === 0) {
        const freshId = `session-${Date.now()}`;
        const freshSession: ChatSession = {
          id: freshId,
          title: 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setSessions([freshSession]);
        setActiveSessionId(freshId);
      } else {
        setSessions(remaining);
        if (activeSessionId === id) {
          setActiveSessionId(remaining[0].id);
        }
      }

      showToast('Conversation deleted', 'info');
    }
  };

  // Rename Session Title
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
    showToast('Conversation renamed', 'success');
  };

  // Send Message Flow
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: formatTimestamp(),
    };

    // If session has no messages or default title, rename to first prompt
    const shouldUpdateTitle =
      activeSession.messages.length === 0 || activeSession.title === 'New Chat';
    const computedTitle = shouldUpdateTitle
      ? text.length > 28
        ? text.substring(0, 28) + '...'
        : text
      : activeSession.title;

    // Update session state with user message
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            title: computedTitle,
            messages: [...session.messages, userMessage],
            updatedAt: Date.now(),
          };
        }
        return session;
      })
    );

    if (settings.soundEnabled) {
      playAudioChime('sent');
    }

    setIsLoading(true);

    // Prepare history payload for Express / AI Layer
    const historyPayload = activeSession.messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    try {
      const response = await fetch(`${settings.backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorDetail =
          data?.error || data?.details || 'Error communicating with AI service.';
        const botError: Message = {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Service Error:** ${errorDetail}\n\nPlease check that your Express Backend (\`${settings.backendUrl}\`) and AI Layer (\`:3001\`) are running.`,
          timestamp: formatTimestamp(),
        };

        setSessions((prev) =>
          prev.map((session) =>
            session.id === activeSessionId
              ? { ...session, messages: [...session.messages, botError] }
              : session
          )
        );
        showToast('AI Request Failed', 'error');
      } else {
        const reply = data?.data?.reply || 'No content returned from AI.';
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: formatTimestamp(),
        };

        setSessions((prev) =>
          prev.map((session) =>
            session.id === activeSessionId
              ? { ...session, messages: [...session.messages, botMessage] }
              : session
          )
        );

        if (settings.soundEnabled) {
          playAudioChime('received');
        }
      }
    } catch {
      const botError: Message = {
        id: `bot-net-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Connection Error:** Unable to reach backend at \`${settings.backendUrl}\`.\n\nPlease verify your network connection and server status.`,
        timestamp: formatTimestamp(),
      };

      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeSessionId
            ? { ...session, messages: [...session.messages, botError] }
            : session
        )
      );
      showToast('Backend unreachable', 'error');
      setBackendStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSound = () => {
    const nextVal = !settings.soundEnabled;
    setSettings((prev) => ({ ...prev, soundEnabled: nextVal }));
    showToast(nextVal ? 'Sound Feedback Enabled' : 'Sound Muted', 'info');
  };

  const handleAttachClick = () => {
    showToast('File attachment will be processed in prompt context', 'info');
  };

  return (
    <div className="nova-app-layout">
      {/* Left Column: Chat History & Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isOpen={isSidebarOpen}
        userName={settings.userName}
        userEmail={settings.userEmail}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onShowHelp={() => setIsHelpOpen(true)}
      />

      {/* Right Column: Main Chat Interface */}
      <main className="nova-main-container">
        {/* Top Header */}
        <Header
          currentTitle={activeSession?.title || 'How does AI work?'}
          backendStatus={backendStatus}
          isSidebarOpen={isSidebarOpen}
          soundEnabled={settings.soundEnabled}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onRenameTitle={(newTitle) => handleRenameSession(activeSessionId, newTitle)}
          onToggleSound={handleToggleSound}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Viewport for Messages / Welcome Screen */}
        <div ref={chatViewportRef} className="nova-chat-viewport">
          {messages.length === 0 ? (
            <WelcomeHero
              userName={settings.userName}
              onSelectPrompt={handleSendMessage}
            />
          ) : (
            <div className="nova-messages-container">
              {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
            </div>
          )}

          {isLoading && <TypingIndicator />}
        </div>

        {/* Bottom Input Capsule */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onAttachClick={handleAttachClick}
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(newSettings) => {
          setSettings(newSettings);
          showToast('Settings saved successfully', 'success');
          checkBackendHealth(newSettings.backendUrl, false);
        }}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
