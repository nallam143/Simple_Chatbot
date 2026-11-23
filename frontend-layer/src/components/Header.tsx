import { useState, useEffect } from 'react';
import type { BackendStatus } from '../types/chat';

interface HeaderProps {
  currentTitle: string;
  backendStatus: BackendStatus;
  isSidebarOpen: boolean;
  soundEnabled: boolean;
  onToggleSidebar: () => void;
  onRenameTitle: (newTitle: string) => void;
  onToggleSound: () => void;
  onOpenSettings: () => void;
}

export function Header({
  currentTitle,
  backendStatus,
  isSidebarOpen,
  soundEnabled,
  onToggleSidebar,
  onRenameTitle,
  onToggleSound,
  onOpenSettings,
}: HeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(currentTitle);

  useEffect(() => {
    setTitleInput(currentTitle);
  }, [currentTitle]);

  const handleSave = () => {
    if (titleInput.trim()) {
      onRenameTitle(titleInput.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTitleInput(currentTitle);
      setIsEditing(false);
    }
  };

  return (
    <header className="main-chat-header">
      <div className="chat-header-left">
        {!isSidebarOpen && (
          <button
            type="button"
            className="sidebar-toggle-expand-btn"
            onClick={onToggleSidebar}
            title="Open Sidebar"
            aria-label="Open Sidebar"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}

        <div className="current-chat-title-group">
          <div className="current-chat-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>

          {isEditing ? (
            <input
              type="text"
              className="header-title-input"
              value={titleInput}
              autoFocus
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <h1 className="current-chat-title" onClick={() => setIsEditing(true)}>
              {currentTitle}
            </h1>
          )}

          <button
            type="button"
            className="header-edit-title-btn"
            title="Edit conversation title"
            onClick={() => setIsEditing(!isEditing)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="chat-header-right">
        {/* Live Backend Status Badge */}
        <div className={`status-pill ${backendStatus}`} title={`Backend: ${backendStatus}`}>
          <span className="status-dot"></span>
          <span className="status-label">
            {backendStatus === 'online' ? 'Online' : backendStatus === 'connecting' ? 'Connecting...' : 'Offline'}
          </span>
        </div>

        {/* Sound Toggle Button */}
        <button
          type="button"
          className="header-icon-btn"
          title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          onClick={onToggleSound}
        >
          {soundEnabled ? (
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          ) : (
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          )}
        </button>

        {/* Settings Button */}
        <button
          type="button"
          className="header-icon-btn"
          title="Open Settings"
          onClick={onOpenSettings}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </header>
  );
}
