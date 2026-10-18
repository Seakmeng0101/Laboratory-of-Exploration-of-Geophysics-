import Footer from '../../components/Footer';

/* Same palette and fonts as your Home page, so the About Us pages feel like one site. */

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

    .vm-root {
      --paper: #EDEBE1;
      --paper-dim: #E3E0D2;
      --ink: #1B211D;
      --ink-soft: #4B5049;
      --moss: #33513B;
      --slate: #3E5A68;
      --ochre: #92662E;
      --line: #C9C4B4;
      background: var(--paper);
      color: var(--ink);
      font-family: 'Inter', sans-serif;
    }
    .vm-root .display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }

    /* One orchestrated moment: the ground layers settle into place on load. */
    @keyframes settle {
      from { transform: translateY(-28px); opacity: 0; }
      to   { transform: translateY(0);     opacity: 1; }
    }
    .layer { animation: settle 0.9s cubic-bezier(.2,.7,.2,1) both; }
    .layer:nth-child(1) { animation-delay: 0.45s; }
    .layer:nth-child(2) { animation-delay: 0.30s; }
    .layer:nth-child(3) { animation-delay: 0.15s; }
    .layer:nth-child(4) { animation-delay: 0s; }
    @media (prefers-reduced-motion: reduce) {
      .layer { animation: none; }
    }
    .vm-root :focus-visible { outline: 2px solid var(--moss); outline-offset: 3px; }
  `}</style>
);

/* Cross-section of the ground: the page's one memorable element. */
const Strata = () => (
  <svg
    viewBox="0 0 600 440"
    className="w-full h-auto"
    role="img"
    aria-label="Layers of ground seen in cross-section"
  >
    <g className="layer"><path d="M0 330 C120 300 230 360 340 332 S520 300 600 328 V440 H0Z" fill="#1B211D" /></g>
    <g className="layer"><path d="M0 250 C110 220 220 280 330 252 S510 222 600 248 V440 H0Z" fill="#3E5A68" /></g>
    <g className="layer"><path d="M0 170 C130 140 240 200 350 172 S520 146 600 168 V440 H0Z" fill="#33513B" /></g>
    <g className="layer"><path d="M0 95 C120 70 250 120 360 96 S520 74 600 92 V440 H0Z" fill="#92662E" /></g>
    {/* Drill line with depth ticks */}
    <line x1="470" y1="40" x2="470" y2="420" stroke="#EDEBE1" strokeWidth="2" strokeDasharray="6 6" />
    {[110, 190, 270, 350].map((y) => (
      <line key={y} x1="458" y1={y} x2="482" y2={y} stroke="#EDEBE1" strokeWidth="2" />
    ))}
  </svg>
);

const VALUES = [
  {
    name: 'Scientific rigor',
    text: 'Every interpretation is backed by data, checked against the ground, and explained clearly.',
    color: 'var(--ochre)',
  },
  {
    name: 'Reliability',
    text: 'We deliver on schedule and on scope, so clients can build decisions on our results.',
    color: 'var(--moss)',
  },
  {
    name: 'Innovation',
    text: 'Drone surveys, AI-assisted analysis and modern geophysics reduce risk before drilling or building.',
    color: 'var(--slate)',
  },
  {
    name: 'Sustainability',
    text: 'We support resource development and infrastructure that serves Cambodia for the long term.',
    color: 'var(--ink)',
  },
];

const VisionMissionPage = () => (
  <div className="vm-root">
    <Styles />

    {/* Hero */}
    <section className="max-w-6xl mx-auto px-4 pt-16 pb-14 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <h1 className="display text-4xl md:text-6xl font-medium leading-[1.05]">
          Beyond the Surface. Into the Future.
        </h1>
        <p className="mt-6 text-[var(--ink-soft)] leading-relaxed max-w-md">
          We believe that understanding the ground beneath us is the foundation for building a better future. Our commitment to scientific excellence, innovation, and integrity drives us to deliver reliable subsurface intelligence for Cambodia and beyond.
        </p>
      </div>
      <Strata />
    </section>

    {/* Vision */}
    <section className="bg-[var(--ink)] text-[var(--paper)]">
      <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-[200px_1fr] gap-6 md:gap-12 items-start">
        <p className="display text-6xl md:text-7xl font-medium text-[var(--ochre)] leading-none">2035</p>
        <div>
          <h2 className="display text-2xl md:text-3xl font-medium mb-4">Vision</h2>
          <p className="display text-xl md:text-2xl leading-relaxed max-w-2xl">
            To become the leading geoscience and geophysical exploration company in
            Cambodia and a recognized regional provider in ASEAN by 2035.
          </p>
        </div>
      </div>
    </section>

    {/* Mission */}
    <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-[200px_1fr] gap-6 md:gap-12 items-start">
      <p className="display text-6xl md:text-7xl font-medium text-[var(--moss)] leading-none" aria-hidden="true">
        ↓
      </p>
      <div>
        <h2 className="display text-2xl md:text-3xl font-medium mb-4">Mission</h2>
        <p className="display text-xl md:text-2xl leading-relaxed max-w-2xl text-[var(--ink)]">
          To provide reliable, innovative, and scientifically rigorous subsurface
          intelligence solutions that support sustainable resource development and
          infrastructure growth in Cambodia and beyond.
        </p>
      </div>
    </section>

    {/* Values */}
    <section className="max-w-6xl mx-auto px-4 pb-20">
      <h2 className="display text-2xl md:text-3xl font-medium mb-8">Core values</h2>
      <div className="grid sm:grid-cols-2 gap-5">
        {VALUES.map((v) => (
          <div
            key={v.name}
            className="bg-[var(--paper-dim)] rounded-r-xl border-l-4 p-6"
            style={{ borderColor: v.color }}
          >
            <h3 className="display text-xl font-medium mb-2">{v.name}</h3>
            <p className="text-[var(--ink-soft)] leading-relaxed">{v.text}</p>
          </div>
        ))}
      </div>
    </section>

    <Footer
      address="Room 405I, building I, Institute of technology of Cambodia,  Russian Federation Boulevard, Phnom Penh, Cambodia"
      phone="+855 87550501 & +855 85818336"
      email="leg.ggg.itc@gmail.com"
      facebookUrl="https://www.facebook.com/share/1C49f1S1tz/"
      telegramUrl="https://t.me/MuoyYiGeophysicist"
      linkedInUrl="https://www.linkedin.com/company/laboratory-of-exploration-geophysics-ggg-itc/"
    />
  </div>
);

export default VisionMissionPage;
