import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent, type ChangeEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onAttachClick?: () => void;
}

export function ChatInput({ onSendMessage, isLoading, onAttachClick }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height smoothly
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    onSendMessage(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const isSendDisabled = text.trim().length === 0 || isLoading;

  return (
    <footer className="nova-input-footer">
      <div className="nova-input-capsule">
        {/* Attachment Paperclip Button */}
        <button
          type="button"
          className="nova-attach-btn"
          title="Attach file or code snippet"
          aria-label="Attach file"
          onClick={onAttachClick}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
        </button>

        {/* Input Textarea */}
        <div className="nova-textarea-wrapper">
          <textarea
            ref={textareaRef}
            className="nova-textarea"
            placeholder="Type your message..."
            rows={1}
            maxLength={4000}
            autoComplete="off"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Circular Send Button with Paper Plane Icon */}
        <button
          type="button"
          className="nova-send-circle-btn"
          disabled={isSendDisabled}
          aria-label="Send message"
          onClick={() => handleSubmit()}
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
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </footer>
  );
}
