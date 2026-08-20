import React from 'react';
import { Link } from 'react-router-dom';
import { assetUrl } from './api';

/**
 * Shared mini-markdown renderer for Parent Resource pages. Used by both the
 * public ParentResourcePage and the admin editor's live preview, so what you
 * see while editing is exactly what visitors will see.
 *
 * Supports:
 *   - blank-line-separated paragraphs
 *   - **bold** and [text](url) inline
 *   - bare URLs (https://...) auto-linked, no markdown syntax needed
 *   - bullet lists starting with `- `
 *   - headings starting with `**text**` on a line by themselves become <h3>
 *   - ![alt](url) images — full-width when alone on a line, small/inline otherwise
 */
export const renderInline = (text) => {
  const parts = [];
  let i = 0;
  const regex = /(\*\*([^*]+)\*\*)|(!\[([^\]]*)\]\(([^)]+)\))|(\[([^\]]+)\]\(([^)]+)\))|(https?:\/\/[^\s<]+)/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > i) parts.push(text.slice(i, m.index));
    if (m[1]) {
      parts.push(<strong key={m.index}>{m[2]}</strong>);
    } else if (m[3]) {
      parts.push(
        <img
          key={m.index}
          src={assetUrl(m[5])}
          alt={m[4] || ''}
          className="inline-block max-h-8 align-middle rounded mx-1"
        />
      );
    } else if (m[6]) {
      const href = m[8];
      const label = m[7];
      const isExternal = /^https?:\/\//.test(href);
      parts.push(
        isExternal ? (
          <a key={m.index} href={href} target="_blank" rel="noopener noreferrer" className="text-[#0f1e42] font-semibold underline underline-offset-2 hover:text-yellow-700">{label}</a>
        ) : (
          <Link key={m.index} to={href} className="text-[#0f1e42] font-semibold underline underline-offset-2 hover:text-yellow-700">{label}</Link>
        )
      );
    } else if (m[9]) {
      let url = m[9];
      let trailing = '';
      const trailingMatch = url.match(/[.,;:!?)\]"']+$/);
      if (trailingMatch) {
        trailing = trailingMatch[0];
        url = url.slice(0, url.length - trailing.length);
      }
      parts.push(
        <a key={m.index} href={url} target="_blank" rel="noopener noreferrer" className="text-[#0f1e42] font-semibold underline underline-offset-2 hover:text-yellow-700">{url}</a>
      );
      if (trailing) parts.push(trailing);
    }
    i = m.index + m[0].length;
  }
  if (i < text.length) parts.push(text.slice(i));
  return parts;
};

export const renderBody = (body) => {
  if (!body) return null;
  const blocks = body.replace(/\r\n/g, '\n').split(/\n{2,}/);
  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Heading: single line that's entirely **bold**
    const headingMatch = trimmed.match(/^\*\*([^*]+)\*\*$/);
    if (headingMatch) {
      return <h3 key={idx} className="text-lg font-bold text-[#0f1e42] mt-5 mb-2">{headingMatch[1]}</h3>;
    }

    // Illustration: a block that's just an image, on its own — render full width
    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      return (
        <img
          key={idx}
          src={assetUrl(imageMatch[2])}
          alt={imageMatch[1] || ''}
          className="w-full max-h-[420px] object-contain rounded-xl my-4 border border-gray-100"
        />
      );
    }

    // Bullet list
    if (trimmed.split('\n').every((l) => l.trim().startsWith('- '))) {
      return (
        <ul key={idx} className="list-disc list-outside pl-6 my-3 space-y-1.5 text-gray-700">
          {trimmed.split('\n').map((line, li) => (
            <li key={li}>{renderInline(line.replace(/^-\s*/, ''))}</li>
          ))}
        </ul>
      );
    }

    // Regular paragraph (preserve soft line breaks within a block)
    return (
      <p key={idx} className="text-gray-700 leading-relaxed my-3">
        {trimmed.split('\n').map((line, li, arr) => (
          <React.Fragment key={li}>
            {renderInline(line)}
            {li < arr.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    );
  });
};
