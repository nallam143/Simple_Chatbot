interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card help-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
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
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h3 className="modal-title">Nova AI - Help & Shortcuts</h3>
          </div>
          <button
            type="button"
            className="modal-close"
            aria-label="Close help"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="help-section">
            <h4 className="help-section-title">⌨️ Keyboard Shortcuts</h4>
            <div className="shortcut-row">
              <span className="shortcut-desc">Send message</span>
              <kbd className="shortcut-key">Enter</kbd>
            </div>
            <div className="shortcut-row">
              <span className="shortcut-desc">Insert new line in input</span>
              <kbd className="shortcut-key">Shift + Enter</kbd>
            </div>
            <div className="shortcut-row">
              <span className="shortcut-desc">Close any modal dialog</span>
              <kbd className="shortcut-key">Escape</kbd>
            </div>
          </div>

          <div className="help-section">
            <h4 className="help-section-title">⚡ Feature Highlights</h4>
            <ul className="help-feature-list">
              <li><strong>Multi-Session Chat History:</strong> Start multiple conversations and switch between them anytime from the left column.</li>
              <li><strong>One-Click Code Copy:</strong> Hover or click the copy button on code snippets to copy them instantly.</li>
              <li><strong>Title Renaming:</strong> Click on the conversation title or pencil icon to rename any chat session.</li>
              <li><strong>Backend Resilience:</strong> Live connectivity indicators ping Express on port 5001 and automatically alert if services go offline.</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
