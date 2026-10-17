export interface Division {
  code: string;
  name: string;
  services: string[];
  revenue: number;
  accent: string;
}

/** "Ground magnetics" -> "ground-magnetics", "Induced polarization (IP)" -> "induced-polarization-ip" */
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const serviceUrl = (service: string) => `/services?service=${slugify(service)}`;

export const DIVISIONS: Division[] = [
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
    services: ['Seismic refraction', 'MASW', 'GPR', 'Utility mapping', 'Foundation investigations'],
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
    services: ['Drone mapping', 'LiDAR', 'GIS', 'Remote sensing', 'Digital terrain modeling'],
    revenue: 15,
    accent: '#3E6B8A',
  },
];

/** Footer details shared by every page */
export const FOOTER_PROPS = {
  address: '#244, Street 26, Khan Pou Senchey, Phnom Penh, Cambodia',
  phone: '088 78905647',
  email: 'soemseakmeng@gmail.com',
  facebookUrl: 'https://facebook.com/yourpage',
  telegramUrl: 'https://t.me/yourpage',
  linkedInUrl: 'https://linkedin.com/company/yourpage',
};