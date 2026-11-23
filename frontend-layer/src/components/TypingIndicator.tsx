export function TypingIndicator() {
  return (
    <div id="typing-indicator" className="typing-indicator-row">
      <div className="message-avatar bot-avatar">
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
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 12h8"></path>
        </svg>
      </div>
      <div className="typing-bubble">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-label">Nexus is thinking...</span>
      </div>
    </div>
  );
}
