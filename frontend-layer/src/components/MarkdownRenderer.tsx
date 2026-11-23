import { useState, type ReactNode } from 'react';

interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="code-container">
      <div className="code-header">
        <span className="code-lang">{language || 'code'}</span>
        <button
          type="button"
          className="btn-copy-code"
          onClick={handleCopy}
          aria-label="Copy code block"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderInline(text: string): ReactNode[] {
  // Pattern to match inline code, bold, italic, links
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline code `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={index} className="inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    // Italic *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    // Link [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content by code blocks first
  const blocks: ReactNode[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_\-+]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      blocks.push(parseTextBlocks(textBefore, `text-${lastIndex}`));
    }

    const language = match[1]?.trim() || 'code';
    const code = match[2]?.trimEnd() || '';
    blocks.push(
      <CodeBlock key={`code-${match.index}`} language={language} code={code} />
    );

    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    blocks.push(parseTextBlocks(remainingText, `text-${lastIndex}`));
  }

  return <div className="markdown-body">{blocks}</div>;
}

function parseTextBlocks(text: string, keyPrefix: string): ReactNode {
  const paragraphs = text.split(/\n\n+/);

  return (
    <div key={keyPrefix} className="text-blocks">
      {paragraphs.map((paragraph, pIdx) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return null;

        const lines = trimmed.split('\n');

        // Check for Headings
        if (trimmed.startsWith('### ')) {
          return <h3 key={`${keyPrefix}-h3-${pIdx}`}>{renderInline(trimmed.slice(4))}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={`${keyPrefix}-h2-${pIdx}`}>{renderInline(trimmed.slice(3))}</h2>;
        }
        if (trimmed.startsWith('# ')) {
          return <h1 key={`${keyPrefix}-h1-${pIdx}`}>{renderInline(trimmed.slice(2))}</h1>;
        }

        // Check for Blockquote
        if (trimmed.startsWith('> ')) {
          const quoteText = lines.map(line => line.replace(/^>\s?/, '')).join(' ');
          return (
            <blockquote key={`${keyPrefix}-quote-${pIdx}`}>
              {renderInline(quoteText)}
            </blockquote>
          );
        }

        // Check for Unordered List
        if (lines.every(line => /^\s*[-*]\s+/.test(line))) {
          return (
            <ul key={`${keyPrefix}-ul-${pIdx}`}>
              {lines.map((line, lIdx) => (
                <li key={lIdx}>{renderInline(line.replace(/^\s*[-*]\s+/, ''))}</li>
              ))}
            </ul>
          );
        }

        // Check for Ordered List
        if (lines.every(line => /^\s*\d+\.\s+/.test(line))) {
          return (
            <ol key={`${keyPrefix}-ol-${pIdx}`}>
              {lines.map((line, lIdx) => (
                <li key={lIdx}>{renderInline(line.replace(/^\s*\d+\.\s+/, ''))}</li>
              ))}
            </ol>
          );
        }

        // Normal paragraph with line breaks
        return (
          <p key={`${keyPrefix}-p-${pIdx}`}>
            {lines.map((line, lIdx) => (
              <span key={lIdx}>
                {renderInline(line)}
                {lIdx < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
