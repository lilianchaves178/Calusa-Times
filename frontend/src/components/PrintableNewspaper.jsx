import React from 'react';
import { assetUrl } from '../lib/api';

const truncate = (s = '', n = 240) => {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  return t.slice(0, n).replace(/\s+\S*$/, '') + '…';
};

const Kicker = ({ label }) => <div className="paper-kicker">{(label || 'news').toUpperCase()}</div>;

/**
 * Renders the two-page 8.5×11 printable newspaper.
 * Article/achievement data is passed in as props so the component is
 * reusable from both the admin preview page and a public download page.
 */
const PrintableNewspaper = ({ monthLabel, articles = [], achievements = [] }) => {
  const frontArticles = articles.slice(0, 4);
  const backArticles = articles.slice(4, 10);
  const leadArticle = frontArticles[0];
  const frontSecondary = frontArticles.slice(1);

  if (articles.length === 0 && achievements.length === 0) return null;

  return (
    <div className="print-sheets">
      {/* =========== FRONT PAGE =========== */}
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

        {leadArticle && (
          <article className="paper-lead" data-testid="print-lead-article">
            <Kicker label={leadArticle.category} />
            <h2 className="paper-lead-title">{leadArticle.title}</h2>
            <p className="paper-byline">
              By {leadArticle.author}{leadArticle.grade ? `, ${leadArticle.grade}` : ''}
            </p>
            {leadArticle.image_url && (
              <img src={assetUrl(leadArticle.image_url)} alt={leadArticle.title} className="paper-lead-image" />
            )}
            <p className="paper-lead-body">
              {truncate(leadArticle.description + ' ' + (leadArticle.content || ''), 520)}
            </p>
          </article>
        )}

        {frontSecondary.length > 0 && (
          <div className="paper-grid">
            {frontSecondary.map((a) => (
              <article className="paper-column-story" key={a.id}>
                <Kicker label={a.category} />
                <h3 className="paper-story-title">{a.title}</h3>
                <p className="paper-byline">By {a.author}</p>
                {a.image_url && <img src={assetUrl(a.image_url)} alt={a.title} className="paper-story-image" />}
                <p className="paper-story-body">{truncate(a.description, 220)}</p>
              </article>
            ))}
          </div>
        )}

        <footer className="paper-footer">
          <span>The Calusa Times · {monthLabel}</span>
          <span>calusakidnews · Page 1</span>
        </footer>
      </section>

      {/* =========== BACK PAGE =========== */}
      {(backArticles.length > 0 || achievements.length > 0) && (
        <section className="print-sheet" data-testid="print-sheet-back">
          <header className="paper-masthead-mini">
            <h2>The Calusa Times · {monthLabel}</h2>
            <span>Continued</span>
          </header>

          {backArticles.length > 0 && (
            <div className="paper-grid">
              {backArticles.map((a) => (
                <article className="paper-column-story" key={a.id}>
                  <Kicker label={a.category} />
                  <h3 className="paper-story-title">{a.title}</h3>
                  <p className="paper-byline">By {a.author}</p>
                  {a.image_url && <img src={assetUrl(a.image_url)} alt={a.title} className="paper-story-image" />}
                  <p className="paper-story-body">{truncate(a.description, 220)}</p>
                </article>
              ))}
            </div>
          )}

          {achievements.length > 0 && (
            <section className="paper-achievements">
              <h3 className="paper-section-heading">🏆 Achievements of the Month</h3>
              <ul className="paper-achievements-list">
                {achievements.slice(0, 10).map((h) => (
                  <li key={h.id}>
                    <strong>{h.title}</strong> — {h.recipient}
                    <span className="paper-chip">{h.category}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

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
