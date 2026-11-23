import { useState, useEffect, type FormEvent } from 'react';
import type { AppSettings } from '../types/chat';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onClose: () => void;
  onSave: (newSettings: AppSettings) => void;
}

interface TestResult {
  status: 'success' | 'error';
  message: string;
}

export function SettingsModal({
  isOpen,
  settings,
  onClose,
  onSave,
}: SettingsModalProps) {
  const [backendUrl, setBackendUrl] = useState(settings.backendUrl);
  const [userName, setUserName] = useState(settings.userName || 'John Doe');
  const [userEmail, setUserEmail] = useState(settings.userEmail || 'john@example.com');
  const [persistChat, setPersistChat] = useState(settings.persistChat);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBackendUrl(settings.backendUrl);
      setUserName(settings.userName || 'John Doe');
      setUserEmail(settings.userEmail || 'john@example.com');
      setPersistChat(settings.persistChat);
      setSoundEnabled(settings.soundEnabled);
      setTestResult(null);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    const cleanUrl = backendUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl) return;

    setTesting(true);
    setTestResult(null);
    const startTime = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${cleanUrl}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);

      const duration = Math.round(performance.now() - startTime);

      if (res.ok) {
        const data = await res.json();
        setTestResult({
          status: 'success',
          message: `✓ Success! Backend reachable at ${cleanUrl} (${duration}ms). Service: ${data.service || 'ok'}`,
        });
      } else {
        setTestResult({
          status: 'error',
          message: `❌ Connected but received HTTP ${res.status}. Check backend logs.`,
        });
      }
    } catch {
      setTestResult({
        status: 'error',
        message: `❌ Failed to connect to ${cleanUrl}. Ensure Express is running on port 5001.`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const cleanUrl = backendUrl.trim().replace(/\/+$/, '') || 'http://localhost:5001';
    onSave({
      ...settings,
      backendUrl: cleanUrl,
      userName: userName.trim() || 'John Doe',
      userEmail: userEmail.trim() || 'john@example.com',
      persistChat,
      soundEnabled,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
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
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <h3 className="modal-title">Settings & Preferences</h3>
          </div>
          <button
            type="button"
            id="btn-close-settings"
            className="modal-close"
            aria-label="Close settings"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            {/* User Profile Info */}
            <div className="setting-group">
              <label className="setting-label">User Profile</label>
              <div className="setting-profile-inputs">
                <input
                  type="text"
                  className="setting-input"
                  placeholder="Display Name (e.g. John Doe)"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                <input
                  type="email"
                  className="setting-input"
                  placeholder="Email (e.g. john@example.com)"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Backend URL */}
            <div className="setting-group">
              <label htmlFor="backend-url-input" className="setting-label">
                Backend Gateway URL
              </label>
              <div className="input-with-button">
                <input
                  type="url"
                  id="backend-url-input"
                  className="setting-input"
                  value={backendUrl}
                  placeholder="http://localhost:5001"
                  onChange={(e) => setBackendUrl(e.target.value)}
                  required
                />
                <button
                  type="button"
                  id="btn-test-backend"
                  className="btn-secondary"
                  disabled={testing}
                  onClick={handleTestConnection}
                >
                  {testing ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
              <p className="setting-help">
                Default Express server is <code>http://localhost:5001</code>.
              </p>
            </div>

            {testResult && (
              <div className={`test-result-box ${testResult.status}`}>
                {testResult.message}
              </div>
            )}

            {/* Storage and Audio Toggles */}
            <div className="setting-group">
              <label className="setting-label">Application Toggles</label>
              <div className="setting-row">
                <span>Save conversation history across sessions</span>
                <input
                  type="checkbox"
                  id="setting-persist-chat"
                  className="custom-toggle"
                  checked={persistChat}
                  onChange={(e) => setPersistChat(e.target.checked)}
                />
              </div>
              <div className="setting-row">
                <span>Enable audio chimes for sent and received</span>
                <input
                  type="checkbox"
                  id="setting-sound-enabled"
                  className="custom-toggle"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" id="btn-save-settings" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
