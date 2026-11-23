import { useState } from 'react';
import type { Message } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = message.content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`nova-message-row ${isUser ? 'user-row' : 'bot-row'}`}>
      {/* Bot Avatar on the Left */}
      {!isUser && (
        <div className="bot-message-avatar-wrap">
          <img
            src="/nova_robot_avatar.jpg"
            alt="Nova Assistant"
            className="bot-message-avatar-img"
          />
          <span className="bot-avatar-ring-glow"></span>
        </div>
      )}

      {/* Message Bubble + Meta */}
      <div className="nova-message-body">
        <div className={`nova-message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
          {isUser ? (
            <p className="nova-user-text">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        <div className="nova-message-meta">
          <span className="nova-message-time">{message.timestamp}</span>

          <button
            type="button"
            className="nova-copy-btn"
            title="Copy message"
            onClick={handleCopy}
          >
            {copied ? (
              <span className="copy-success">✓ Copied</span>
            ) : (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* User Avatar on the Right */}
      {isUser && (
        <div className="user-message-avatar-wrap">
          <div className="user-message-avatar-circle">
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
