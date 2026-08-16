const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

    body {
      --paper: #EDEBE1;
      --paper-dim: #E3E0D2;
      --ink: #1B211D;
      --ink-soft: #4B5049;
      --moss: #33513B;
      --moss-dark: #24392A;
      --slate: #3E5A68;
      --ochre: #92662E;
      --line: #C9C4B4;
      background: var(--paper);
      color: var(--ink);
      font-family: 'Inter', sans-serif;
    }
    .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
    .font-mono { font-family: 'IBM Plex Mono', monospace; }

    .reveal {
      opacity: 0;
      transform: translateY(14px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }
    .reveal.is-visible { opacity: 1; transform: translateY(0); }

    @media (prefers-reduced-motion: reduce) {
      .reveal { opacity: 1; transform: none; transition: none; }
    }

    :focus-visible {
      outline: 2px solid var(--moss);
      outline-offset: 3px;
    }
  `}</style>
);

export default GlobalStyles;