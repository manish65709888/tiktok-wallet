const TT_THEMES = {
  dark:   { bg: '#121212', bg2: '#1a1a1a', bg3: '#1e1e1e', card: 'linear-gradient(135deg,#1a1a2e,#16213e)', text: '#fff', sub: '#aaa', border: '#2a2a2a', pill: '#1e1e1e' },
  light:  { bg: '#f0f0f0', bg2: '#fff',    bg3: '#f5f5f5', card: 'linear-gradient(135deg,#e8eaf6,#e3f2fd)', text: '#111', sub: '#555', border: '#ddd',    pill: '#fff' },
  pink:   { bg: '#1a0a0e', bg2: '#2a1018', bg3: '#220d14', card: 'linear-gradient(135deg,#2a0a14,#3d0a20)', text: '#fff', sub: '#ffb3c1', border: '#4a1525', pill: '#220d14' },
  blue:   { bg: '#050d1a', bg2: '#0a1628', bg3: '#0d1f35', card: 'linear-gradient(135deg,#0a1628,#0d2a4a)', text: '#fff', sub: '#7ec8e3', border: '#1a3a5c', pill: '#0d1f35' },
  purple: { bg: '#0e0a1a', bg2: '#1a1028', bg3: '#160d22', card: 'linear-gradient(135deg,#1a0a2e,#2a1040)', text: '#fff', sub: '#c9b3ff', border: '#3a1a5c', pill: '#160d22' },
};

function applyTheme(name) {
  const t = TT_THEMES[name] || TT_THEMES.dark;
  const s = document.documentElement.style;
  s.setProperty('--bg',     t.bg);
  s.setProperty('--bg2',    t.bg2);
  s.setProperty('--bg3',    t.bg3);
  s.setProperty('--card',   t.card);
  s.setProperty('--text',   t.text);
  s.setProperty('--sub',    t.sub);
  s.setProperty('--border', t.border);
  s.setProperty('--pill',   t.pill);
  document.body.style.background = t.bg;
  document.body.style.color = t.text;
}

// Apply immediately on load
(function () {
  const saved = localStorage.getItem('tt_theme') || 'dark';
  applyTheme(saved);
})();
