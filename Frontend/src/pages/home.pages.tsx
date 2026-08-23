import { useEffect, useState, useCallback, useRef } from 'react';
import { getAllProjects } from '../api/project.api';
import { Project } from '../types';
import mex1 from '../assets/mex1.jpg';
import mex2 from '../assets/mex2.webp';
import mex3 from '../assets/mex3.jpg';
import Footer from '../components/Footer';
import logo1 from '../assets/logo1.jpg';
import logo2 from '../assets/logo2.jpg';
import logo3 from '../assets/logo3.webp';
import logo4 from '../assets/logo4.png';

<Footer
  address="#244, Street 26, Khan Pou Senchey, Phnom Penh, Cambodia"
  phone="088 78905647"
  email="soemseakmeng@gmail.com"
  facebookUrl="https://facebook.com/yourpage"
  telegramUrl="https://t.me/yourpage"
  linkedInUrl="https://linkedin.com/company/yourpage"
/>

/* ------------------------------------------------------------------ */
/* Design tokens                                                      */
/* Move the @import below into index.html for production performance */
/* ------------------------------------------------------------------ */

interface OrgNode {
  title: string;
  children?: OrgNode[];
}

interface Division {
  code: string;
  name: string;
  services: string[];
  revenue: number;
  accent: string;
}

const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

    .surface-root {
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

    .surface-root :focus-visible {
      outline: 2px solid var(--moss);
      outline-offset: 3px;
    }
  `}</style>
);

/* ------------------------------------------------------------------ */
/* Scroll-reveal wrapper (no external deps)                           */
/* ------------------------------------------------------------------ */

const Reveal = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`}>
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Carousel                                                            */
/* ------------------------------------------------------------------ */

interface CarouselProps {
  images: { src: string; alt: string }[];
  intervalMs?: number;
  autoPlay?: boolean;
}

const ChevronIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg
    className="w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d={direction === 'left' ? 'm15 19-7-7 7-7' : 'm9 5 7 7-7 7'}
    />
  </svg>
);

const Carousel = ({ images, intervalMs = 3800, autoPlay = true }: CarouselProps) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const prev = useCallback(() => {
    setCurrent((p) => (p === 0 ? images.length - 1 : p - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!autoPlay || isPaused) return;
    const interval = setInterval(next, intervalMs);
    return () => clearInterval(interval);
  }, [autoPlay, isPaused, intervalMs, next]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [prev, next]);

  return (
    <div
      className="relative w-full bg-[var(--ink)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      role="region"
      aria-label="Field documentation carousel"
    >
      <div className="relative h-72 overflow-hidden md:h-[560px]">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            aria-hidden={index !== current}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/60 via-transparent to-transparent z-20 pointer-events-none" />
        <p className="absolute bottom-6 left-6 z-30 font-mono text-[11px] tracking-widest text-[var(--paper)]/80">
          FIELD DOCUMENTATION — {String(current + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </p>
      </div>

      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-0 top-0 z-30 flex h-full items-center px-4 text-[var(--paper)]"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--ink)]/40 hover:bg-[var(--ink)]/60 backdrop-blur-sm">
          <ChevronIcon direction="left" />
        </span>
      </button>

      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="absolute right-0 top-0 z-30 flex h-full items-center px-4 text-[var(--paper)]"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--ink)]/40 hover:bg-[var(--ink)]/60 backdrop-blur-sm">
          <ChevronIcon direction="right" />
        </span>
      </button>

      <div className="absolute bottom-4 right-6 z-30 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === current}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              index === current ? 'bg-[var(--paper)]' : 'bg-[var(--paper)]/40 hover:bg-[var(--paper)]/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Overview                                                             */
/* ------------------------------------------------------------------ */

const OverviewSection = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 pt-6 pb-14 grid grid-cols-1 md:grid-cols-2 gap-6">
      <Reveal>
        <div className="h-full bg-[var(--paper-dim)] border-l-2 border-emerald-800 rounded-r-xl p-7">
          <p className="font-mono text-[11px] tracking-widest text-[var(--ink-soft)] mb-2">OVERVIEW</p>
          <h2 className="font-display text-2xl font-medium mb-3">Lab Overview</h2>
          <p className="text-[var(--ink-soft)] leading-relaxed">
            The company will leverage advanced geophysical technologies,
            drone-based surveying, AI-assisted data analytics, and local
            scientific expertise to reduce exploration risk and improve
            decision-making for government agencies, mining companies,
            engineering firms, and development partners.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="h-full bg-[var(--paper-dim)] border-l-2 border-slate-600 rounded-r-xl p-7">
          <p className="font-mono text-[11px] tracking-widest text-[var(--ink-soft)] mb-2">VISION &amp; MISSION</p>
          <h2 className="font-display text-2xl font-medium mb-2">Vision</h2>
          <p className="text-[var(--ink-soft)] leading-relaxed mb-5">
            To become the leading geoscience and geophysical exploration
            company in Cambodia and a recognized regional provider in ASEAN
            by 2035.
          </p>
          <h2 className="font-display text-2xl font-medium mb-2">Mission</h2>
          <p className="text-[var(--ink-soft)] leading-relaxed">
            To provide reliable, innovative, and scientifically rigorous
            subsurface intelligence solutions that support sustainable
            resource development and infrastructure growth in Cambodia and
            beyond.
          </p>
        </div>
      </Reveal>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Company structure org chart                                         */
/* ------------------------------------------------------------------ */

// const ORG_CHART: OrgNode = {
//   title: 'Managing Director',
//   children: [
//     {
//       title: 'Technical Service Department',
//       children: [
//         { title: 'Geophysical Survey Team' },
//         { title: 'Groundwater Survey Team' },
//         { title: 'GIS & Remote Sensing' },
//         { title: 'Geological & Environmental Team' },
//       ],
//     },
//     { title: 'Business Development' },
//     { title: 'Finance and Admin' },
//   ],
// };

// const NodeCard = ({ title }: { title: string }) => (
//   <div className="relative">
//     <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-lg bg-cyan-500" aria-hidden="true" />
//     <div className="relative bg-white border-2 border-cyan-500 rounded-lg px-4 py-3 text-center text-sm font-semibold text-gray-800 min-h-[64px] flex items-center justify-center">
//       {title}
//     </div>
//   </div>
// );

// const CompanyStructure = () => {
//   const departments = ORG_CHART.children ?? [];
//   const technical = departments.find(d => d.title === 'Technical Service Department');
//   const otherDepartments = departments.filter(d => d.title !== 'Technical Service Department');
//   const teams = technical?.children ?? [];

//   return (
//     <section className="bg-white py-16 px-4">
//       <div className="max-w-5xl mx-auto">
//         <div className="text-center mb-10">
//           <h2 className="font-display text-3xl font-medium mb-2">Lab Structure</h2>
//         </div>

//         {/* Optional lab photo strip — remove if not needed here */}
//         {/* <img
//           src={Lab}
//           alt="Lab team in the field"
//           className="w-full h-48 sm:h-64 object-cover rounded-xl mb-14"
//         /> */}

//         {/* Tier 1 — Managing Director */}
//         <div className="flex justify-center mb-10">
//           <div className="w-56">
//             <NodeCard title={ORG_CHART.title} />
//           </div>
//         </div>

//         {/* Connector: MD down to departments row */}
//         <div className="flex justify-center">
//           <div className="w-px h-8 bg-gray-300" aria-hidden="true" />
//         </div>

//         {/* Tier 2 — Departments */}
//         <div className="relative">
//           <div
//             className="hidden sm:block absolute top-0 left-[16.5%] right-[16.5%] h-px bg-gray-300"
//             aria-hidden="true"
//           />
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 pt-0 sm:pt-8">
//             {technical && (
//               <div className="flex flex-col items-center">
//                 <div className="hidden sm:block w-px h-8 bg-gray-300 -mt-8 mb-0" aria-hidden="true" />
//                 <div className="w-full max-w-[220px]">
//                   <NodeCard title={technical.title} />
//                 </div>
//               </div>
//             )}
//             {otherDepartments.map(dept => (
//               <div key={dept.title} className="flex flex-col items-center">
//                 <div className="hidden sm:block w-px h-8 bg-gray-300 -mt-8 mb-0" aria-hidden="true" />
//                 <div className="w-full max-w-[220px]">
//                   <NodeCard title={dept.title} />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Connector: Technical Service Department down to teams row */}
//         {teams.length > 0 && (
//           <>
//             <div className="flex justify-start sm:justify-center mt-6">
//               <div className="w-px h-8 bg-gray-300 sm:ml-[16.6%]" aria-hidden="true" />
//             </div>

//             {/* Tier 3 — Teams under Technical Service Department */}
//             <div className="relative">
//               <div
//                 className="hidden sm:block absolute top-0 left-[calc(16.6%+1px)] right-[calc(50%+8.3%)] h-px bg-gray-300"
//                 aria-hidden="true"
//               />
//               <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 gap-y-8 pt-0 sm:pt-8 max-w-3xl sm:ml-0">
//                 {teams.map(team => (
//                   <div key={team.title} className="flex flex-col items-center">
//                     <div className="hidden sm:block w-px h-8 bg-gray-300 -mt-8 mb-0" aria-hidden="true" />
//                     <div className="w-full">
//                       <NodeCard title={team.title} />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </section>
//   );
// };

/* ------------------------------------------------------------------ */
/* Business Divisions                                                  */
/* ------------------------------------------------------------------ */

const DIVISIONS: Division[] = [
  {
    code: 'Division A',
    name: 'Mineral Exploration',
    services: [
      'Ground magnetics',
      'Drone magnetics',
      'Induced polarization (IP)',
      'Gravity surveys',
      'Electromagnetic surveys',
      'Geological mapping',
      'Resource targeting',
    ],
    revenue: 40,
    accent: 'var(--ochre)',
  },
  {
    code: 'Division B',
    name: 'Engineering Geophysics',
    services: [
      'Seismic refraction',
      'MASW',
      'GPR',
      'Utility mapping',
      'Foundation investigations',
    ],
    revenue: 25,
    accent: 'var(--slate)',
  },
  {
    code: 'Division C',
    name: 'Groundwater Exploration',
    services: [
      'Electrical resistivity tomography',
      'Vertical electrical sounding',
      'Aquifer mapping',
      'Hydrogeological assessment',
    ],
    revenue: 20,
    accent: 'var(--moss)',
  },
  {
    code: 'Division D',
    name: 'Geospatial & Remote Sensing',
    services: [
      'Drone mapping',
      'LiDAR',
      'GIS',
      'Remote sensing',
      'Digital terrain modeling',
    ],
    revenue: 15,
    accent: '#3E6B8A',
  },
];

const DivisionCard = ({ division }: { division: Division }) => (
  <div
    className="h-full bg-[var(--paper-dim)] border-l-2 rounded-r-xl p-6 flex flex-col"
    style={{ borderColor: division.accent }}
  >
    <p className="font-mono text-[11px] tracking-widest text-[var(--ink-soft)] mb-1">
      {division.code.toUpperCase()}
    </p>
    <h3 className="font-display text-xl font-medium mb-3">{division.name}</h3>

    <p className="font-mono text-[10px] tracking-widest text-[var(--ink-soft)] mb-2">
      SERVICES
    </p>
    <ul className="space-y-1.5 mb-5 flex-1">
      {division.services.map((service) => (
        <li key={service} className="flex items-start gap-2 text-sm text-[var(--ink-soft)]">
          <span
            className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
            style={{ backgroundColor: division.accent }}
          />
          {service}
        </li>
      ))}
    </ul>

    {/* <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="font-mono text-[10px] tracking-widest text-[var(--ink-soft)]">
          REVENUE CONTRIBUTION
        </p>
        <p className="font-mono text-[11px] font-medium text-[var(--ink)]">
          {division.revenue}%
        </p>
      </div>
      <div className="w-full h-1.5 rounded-full bg-[var(--line)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${division.revenue}%`, backgroundColor: division.accent }}
        />
      </div>
    </div> */}
  </div>
);

const BusinessDivisions = () => (
  <section className="max-w-6xl mx-auto px-4 py-14">
    <Reveal className="text-center mb-10">
      <p className="font-mono text-[11px] tracking-widest text-[var(--ink-soft)] mb-2">
        WHAT WE DO
      </p>
      <h2 className="font-display text-3xl font-medium">Business Divisions</h2>
    </Reveal>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
      {DIVISIONS.map((division) => (
        <Reveal key={division.code} className="h-full">
          <DivisionCard division={division} />
        </Reveal>
      ))}
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* Scope of Service                                                    */
/* ------------------------------------------------------------------ */

const SCOPE_OF_SERVICE = [
  'Mining and mineral exploration',
  'Groundwater exploration',
  'Infrastructure development',
  'Environmental assessment',
  'Energy projects',
  'GIS and remote sensing',
];

const CheckIcon = () => (
  <svg
    className="w-5 h-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.5 12.75 6 6 9-13.5"
    />
  </svg>
);

const ScopeOfService = () => (
  <section className="max-w-6xl mx-auto px-4 py-14">
    <Reveal className="text-center mb-10">
      <p className="font-mono text-[11px] tracking-widest text-[var(--ink-soft)] mb-2">
        WHAT WE OFFER
      </p>
      <h2 className="font-display text-3xl font-medium">Scope of Service</h2>
    </Reveal>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
      {SCOPE_OF_SERVICE.map((item) => (
        <Reveal key={item}>
          <div className="flex items-center gap-3 bg-[var(--paper-dim)] rounded-lg px-4 py-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--moss)] flex items-center justify-center">
              <CheckIcon />
            </span>
            <span className="text-sm font-medium text-[var(--ink)]">{item}</span>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* Our Clients                                                         */
/* ------------------------------------------------------------------ */

interface Client {
  name: string;
  logo?: string;
  url?: string;
}

const CLIENTS: Client[] = [
  { name: 'ITC', logo: logo1 },
  { name: 'MPWT', logo: logo2 },
  { name: 'MME', logo: logo3 },
  { name: 'Royal Govt.', logo: logo4 },
];

const LogoBadge = ({ client }: { client: Client }) => {
  const badge = (
    <div className="shrink-0 w-36 h-36 rounded-full bg-white border border-[var(--line)] flex items-center justify-center overflow-hidden mx-5 transition-transform duration-500 ease-out hover:scale-110">
      {client.logo ? (
        <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-mono text-[10px] text-[var(--ink-soft)] text-center px-1">
          {client.name}
        </span>
      )}
    </div>
  );

  if (!client.url) return badge;

  return (
    <a href={client.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${client.name} website`}>
      {badge}
    </a>
  );
};

const OurClients = () => (
  <section className="bg-[var(--paper-dim)] py-14 px-4">
    <div className="max-w-5xl mx-auto text-center">
      <h2 className="font-display text-3xl font-medium mb-2">Our Clients</h2>
      <p className="font-mono text-[11px] tracking-widest text-[var(--ink-soft)] mb-10">
        ORGANIZATIONS WE HAVE WORKED WITH
      </p>

      {/* contained loop: constrained to this centered container, not the full browser width */}
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {[...CLIENTS, ...CLIENTS].map((client, i) => (
            <LogoBadge key={`${client.name}-${i}`} client={client} />
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* Recent news — pulled live from the same data as the Projects page   */
/* ------------------------------------------------------------------ */

const parseDescription = (desc: string[]): string[] => {
  try {
    if (!desc || desc.length === 0) return [];
    const first = desc[0];
    if (typeof first === 'string' && first.startsWith('[')) return JSON.parse(first);
    return desc;
  } catch {
    return desc;
  }
};

const NewsCard = ({ item }: { item: Project }) => {
  const bullets = parseDescription(item.description);
  const image = item.images?.[0] ? `http://localhost:4000/${item.images[0]}` : null;

  return (
    <div className="h-full bg-[var(--paper-dim)] rounded-xl overflow-hidden flex flex-col border border-[var(--line)] transition-transform hover:-translate-y-1">
      {image && (
        <img
          src={image}
          alt={item.title.trim()}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
      )}
      <div className="p-5 flex flex-col flex-1">
        <p className="font-mono text-[11px] tracking-widest text-[var(--ink-soft)] mb-2">
          {item.company_title?.toUpperCase()}
        </p>
        <h3 className="font-display text-lg font-medium mb-2">{item.title.trim()}</h3>
        <p className="text-sm text-[var(--ink-soft)] flex-1 mb-5 line-clamp-4">
          {bullets[0]}
        </p>
        <a
          href={item.link || '/projects'}
          target={item.link ? '_blank' : undefined}
          rel={item.link ? 'noreferrer' : undefined}
          className="inline-block self-start text-sm font-medium text-[var(--ink)] border-b border-[var(--ink)] pb-0.5 hover:text-[var(--moss)] hover:border-[var(--moss)] transition-colors"
        >
          Learn more →
        </a>
      </div>
    </div>
  );
};

const RecentNewsSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProjects()
      .then(res => setProjects(res.data.projects.slice(0, 3)))
      .catch(err => console.log('error loading recent projects:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 py-14">
      <Reveal className="text-center mb-10">
        <h2 className="font-display text-3xl font-medium">Recent News</h2>
        <p className="font-mono text-[11px] tracking-widest text-[var(--ink-soft)] mb-2">we have been working with some projects</p>
      </Reveal>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-[var(--line)] overflow-hidden animate-pulse">
              <div className="h-40 bg-[var(--paper-dim)]" />
              <div className="p-5 space-y-2">
                <div className="h-3 w-1/3 bg-[var(--paper-dim)] rounded-full" />
                <div className="h-4 w-2/3 bg-[var(--paper-dim)] rounded-full" />
                <div className="h-3 w-full bg-[var(--paper-dim)] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <p className="text-center text-[var(--ink-soft)]">No projects yet.</p>
      )}

      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {projects.map(item => (
            <Reveal key={item.id} className="h-full">
              <NewsCard item={item} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
};


/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

const IMAGES = [
  { src: mex1, alt: 'Geophysical survey work 1' },
  { src: mex2, alt: 'Geophysical survey work 2' },
  { src: mex3, alt: 'Geophysical survey work 3' },
];

const Home = () => {
  return (
    <div className="surface-root">
      <FontStyles />
      <Carousel images={IMAGES} />
      <OverviewSection />
      <RecentNewsSection />
      {/* <CompanyStructure /> */}
      <BusinessDivisions />
      <ScopeOfService />
      <OurClients />
      <Footer />
    </div>
  );
};

export default Home;
