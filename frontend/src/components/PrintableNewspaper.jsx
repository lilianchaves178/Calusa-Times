import React from 'react';
import { assetUrl } from '../lib/api';

const Kicker = ({ label }) => <div className="paper-kicker">{(label || 'news').toUpperCase()}</div>;

/**
 * Renders a one- or two-sheet 8.5x11 printable newspaper.
 *
 * Layout is text-first: each story gets a compact masthead, a small
 * inline-right thumbnail, and an AI-generated summary.  The content
 * adapts automatically:
 *   - Short months (<= 3 articles) fit on a single sheet, with the
 *     achievements strip inlined at the bottom.
 *   - Longer months flow onto a second sheet; the achievements strip
 *     is placed on whichever page has room.
 */
const SINGLE_PAGE_ARTICLE_LIMIT = 3;

const bodyFor = (article) => {
  if (article.ai_summary) return article.ai_summary;
  const fallback = (article.description || '').trim();
  if (fallback) return fallback;
  const content = (article.content || '').replace(/\s+/g, ' ').trim();
  return content.length > 340 ? content.slice(0, 340).replace(/\s+\S*$/, '') + '…' : content;
};

const StoryBlock = ({ article, lead = false }) => {
  const body = bodyFor(article);
  const hasImage = !!article.image_url;
  const wrapClass = lead ? 'paper-lead-body-wrap' : 'paper-story-body-wrap';
  const thumbClass = lead ? 'paper-lead-thumb' : 'paper-story-thumb';
  const bodyClass = lead ? 'paper-lead-body' : 'paper-story-body';
  const titleClass = lead ? 'paper-lead-title' : 'paper-story-title';

  return (
    <article className={lead ? 'paper-lead' : 'paper-column-story'}>
      <Kicker label={article.category} />
      <h3 className={titleClass}>{article.title}</h3>
      <p className="paper-byline">
        By {article.author}{article.grade ? `, ${article.grade}` : ''}
      </p>

      {hasImage ? (
        <div className={wrapClass}>
          <p className={bodyClass}>{body}</p>
          <img
            src={assetUrl(article.image_url)}
            alt={article.title}
            className={thumbClass}
          />
        </div>
      ) : (
        <p className={bodyClass}>{body}</p>
      )}
    </article>
  );
};

const AchievementsStrip = ({ achievements }) => {
  if (!achievements?.length) return null;
  return (
    <section className="paper-achievements">
      <h3 className="paper-section-heading">🏆 Achievements of the Month</h3>
      <ul className="paper-achievements-list">
        {achievements.slice(0, 12).map((h) => (
          <li key={h.id}>
            <strong>{h.title}</strong> — {h.recipient}
            <span className="paper-chip">{h.category}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

const PrintableNewspaper = ({ monthLabel, articles = [], achievements = [] }) => {
  if (articles.length === 0 && achievements.length === 0) return null;

  const singlePage = articles.length <= SINGLE_PAGE_ARTICLE_LIMIT;
  const [lead, ...rest] = articles;

  if (singlePage) {
    // ---- ONE SHEET layout ----
    return (
      <div className="print-sheets">
        <section className="print-sheet" data-testid="print-sheet-single">
          <header className="paper-masthead">
            <div className="paper-masthead-row">
              <span>Vol. 7</span>
              <span>{monthLabel}</span>
              <span>Est. 2019</span>
            </div>
            <h1 className="paper-title">The Calusa Times</h1>
            <p className="paper-tagline">Calusa Elementary School's Student Gazette</p>
            <div className="paper-masthead-rule" />
          </header>

          {lead && <StoryBlock article={lead} lead />}

          {rest.length > 0 && (
            <div className="paper-grid">
              {rest.map((a) => <StoryBlock key={a.id} article={a} />)}
            </div>
          )}

          {achievements.length > 0 && <AchievementsStrip achievements={achievements} />}

          <footer className="paper-footer">
            <span>The Calusa Times · {monthLabel}</span>
            <span>calusakidnews · Page 1 of 1</span>
          </footer>
        </section>
      </div>
    );
  }

  // ---- TWO SHEETS layout ----
  const frontArticles = articles.slice(0, 4);
  const backArticles = articles.slice(4, 10);
  const leadF = frontArticles[0];
  const secondaryFront = frontArticles.slice(1);

  // Put achievements on back if there are enough back articles; otherwise
  // inline them on the front beside the column stories so the back page
  // isn't orphaned.
  const achievementsOnFront = backArticles.length === 0;

  return (
    <div className="print-sheets">
      {/* FRONT */}
      <section className="print-sheet" data-testid="print-sheet-front">
        <header className="paper-masthead">
          <div className="paper-masthead-row">
            <span>Vol. 7</span>
            <span>{monthLabel}</span>
            <span>Est. 2019</span>
          </div>
          <h1 className="paper-title">The Calusa Times</h1>
          <p className="paper-tagline">Calusa Elementary School's Student Gazette</p>
          <div className="paper-masthead-rule" />
        </header>

        {leadF && <StoryBlock article={leadF} lead />}

        {secondaryFront.length > 0 && (
          <div className="paper-grid">
            {secondaryFront.map((a) => <StoryBlock key={a.id} article={a} />)}
          </div>
        )}

        {achievementsOnFront && <AchievementsStrip achievements={achievements} />}

        <footer className="paper-footer">
          <span>The Calusa Times · {monthLabel}</span>
          <span>calusakidnews · Page 1</span>
        </footer>
      </section>

      {/* BACK — only render if there are back-articles to justify it */}
      {backArticles.length > 0 && (
        <section className="print-sheet" data-testid="print-sheet-back">
          <header className="paper-masthead-mini">
            <h2>The Calusa Times · {monthLabel}</h2>
            <span>Continued</span>
          </header>

          <div className="paper-grid">
            {backArticles.map((a) => <StoryBlock key={a.id} article={a} />)}
          </div>

          {!achievementsOnFront && <AchievementsStrip achievements={achievements} />}

          <footer className="paper-footer">
            <span>Written by Calusa Students · Student-powered since 2019</span>
            <span>Page 2</span>
          </footer>
        </section>
      )}
    </div>
  );
};

export default PrintableNewspaper;
