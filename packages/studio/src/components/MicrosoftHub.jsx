import { useMemo, useState } from 'react';
import { getMicrosoftHubCatalog } from '../microsoft/microsoftHubCatalog.js';

const styles = {
  shell: {
    margin: '0 auto',
    maxWidth: '1120px',
    padding: 'max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom))',
    color: '#111827',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  hero: {
    background: 'linear-gradient(135deg, #f3f6ff 0%, #e8f0ff 100%)',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '16px',
  },
  pageNav: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '8px',
    WebkitOverflowScrolling: 'touch',
  },
  pageButton: {
    border: '1px solid #c7d2fe',
    borderRadius: '999px',
    background: '#ffffff',
    color: '#1d4ed8',
    cursor: 'pointer',
    minHeight: '44px',
    padding: '10px 16px',
    whiteSpace: 'nowrap',
    touchAction: 'manipulation',
  },
  activePageButton: {
    background: '#1d4ed8',
    color: '#ffffff',
  },
  pageBody: {
    marginTop: '16px',
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cta: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '44px',
    padding: '10px 14px',
    borderRadius: '12px',
    background: '#111827',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: 600,
  },
  iosBox: {
    marginTop: '16px',
    background: '#f9fafb',
    borderRadius: '16px',
    padding: '16px',
  },
};

export default function MicrosoftHub({ initialPageId = 'products' }) {
  const catalog = useMemo(() => getMicrosoftHubCatalog(), []);
  const firstPageId = catalog.pages[0]?.id || 'products';
  const initialActivePageId = catalog.pages.some((page) => page.id === initialPageId)
    ? initialPageId
    : firstPageId;
  const [activePageId, setActivePageId] = useState(initialActivePageId);
  const activePage =
    catalog.pages.find((page) => page.id === activePageId) || catalog.pages[0] || null;

  if (!activePage) {
    return <div>No Microsoft hub pages available.</div>;
  }

  return (
    <section style={styles.shell}>
      <div style={styles.hero}>
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#4338ca' }}>
          Microsoft Hub
        </p>
        <h1 style={{ margin: '8px 0 12px', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
          Microsoft products, offers, partner programs, and learning in one place
        </h1>
        <p style={{ margin: 0, lineHeight: 1.6 }}>{catalog.summary}</p>
      </div>

      <nav aria-label="Microsoft hub pages" role="tablist" style={styles.pageNav}>
        {catalog.pages.map((page) => (
          <button
            key={page.id}
            type="button"
            role="tab"
            aria-selected={page.id === activePage.id}
            style={{
              ...styles.pageButton,
              ...(page.id === activePage.id ? styles.activePageButton : null),
            }}
            onClick={() => setActivePageId(page.id)}
          >
            {page.title}
          </button>
        ))}
      </nav>

      <div style={styles.pageBody}>
        <header style={{ marginBottom: '16px' }}>
          <h2 style={{ marginBottom: '8px' }}>{activePage.title}</h2>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{activePage.description}</p>
        </header>

        <div style={styles.cards}>
          {activePage.cards.map((card) => (
            <article key={card.title} style={styles.card}>
              <div>
                <h3 style={{ margin: '0 0 8px' }}>{card.title}</h3>
                <p style={{ margin: 0, lineHeight: 1.6 }}>{card.summary}</p>
              </div>
              <a href={card.href} target="_blank" rel="noreferrer" style={styles.cta}>
                {card.ctaLabel}
              </a>
            </article>
          ))}
        </div>

        {activePage.id === 'apple' ? (
          <aside style={styles.iosBox}>
            <h3 style={{ marginTop: 0 }}>{catalog.iosExperience.title}</h3>
            <p style={{ lineHeight: 1.6 }}>{catalog.iosExperience.summary}</p>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.7 }}>
              {catalog.iosExperience.recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
