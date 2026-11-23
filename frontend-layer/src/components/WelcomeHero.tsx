import type { PromptSuggestion } from '../types/chat';

interface WelcomeHeroProps {
  userName: string;
  onSelectPrompt: (prompt: string) => void;
}

const HERO_PROMPT_CARDS: PromptSuggestion[] = [
  {
    id: 'concept',
    icon: 'lightbulb',
    title: 'Explain a concept',
    subtitle: 'Get simple explanations',
    prompt: 'How does AI work?',
  },
  {
    id: 'write',
    icon: 'pencil',
    title: 'Write something',
    subtitle: 'Draft, edit, or improve text',
    prompt: 'Help me draft a clear, professional project update email.',
  },
  {
    id: 'solve',
    icon: 'gear',
    title: 'Solve a problem',
    subtitle: 'Get step-by-step help',
    prompt: 'Provide a Python code example demonstrating an async REST client.',
  },
  {
    id: 'explore',
    icon: 'sparkle',
    title: 'Explore ideas',
    subtitle: 'Brainstorm and discover',
    prompt: 'Give me 5 innovative ideas for full-stack AI chatbot applications.',
  },
];

export function WelcomeHero({ userName, onSelectPrompt }: WelcomeHeroProps) {
  const firstName = userName ? userName.split(' ')[0] : 'John';

  const renderCardIcon = (iconType: string) => {
    switch (iconType) {
      case 'lightbulb':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="9" y1="18" x2="15" y2="18"></line>
            <line x1="10" y1="22" x2="14" y2="22"></line>
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
          </svg>
        );
      case 'pencil':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
        );
      case 'gear':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        );
      case 'sparkle':
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        );
    }
  };

  return (
    <section className="nova-welcome-hero">
      {/* 3D Glowing Robot Mascot */}
      <div className="hero-avatar-showcase">
        <div className="hero-avatar-outer-glow"></div>
        <div className="hero-avatar-inner-ring">
          <img
            src="/nova_robot_avatar.jpg"
            alt="Nova AI 3D Mascot"
            className="hero-avatar-image"
          />
        </div>
      </div>

      {/* Greeting Heading */}
      <h2 className="hero-greeting-title">
        Hello, <span className="greeting-name-highlight">{firstName}!</span>
      </h2>
      <p className="hero-greeting-subtitle">
        I'm your AI assistant. How can I help you today?
      </p>

      {/* 4 Cards 2x2 Grid */}
      <div className="nova-prompt-grid">
        {HERO_PROMPT_CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            className="nova-prompt-card"
            onClick={() => onSelectPrompt(card.prompt)}
          >
            <div className={`prompt-card-icon-wrapper ${card.id}`}>
              {renderCardIcon(card.icon)}
            </div>
            <div className="prompt-card-text">
              <strong className="prompt-card-title">{card.title}</strong>
              <span className="prompt-card-desc">{card.subtitle}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
