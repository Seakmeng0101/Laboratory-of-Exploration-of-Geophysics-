import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/ITC_logo.png';

interface DropdownItem {
  label: string;
  path: string;
}

interface NavItemProps {
  label: string;
  path?: string;
  items?: DropdownItem[];
}

const NAV_ITEMS: NavItemProps[] = [
  { label: 'Home', path: '/' },
  {
    label: 'About Us',
    path: '/about',
    items: [
      { label: 'Our team', path: '/about/our-team' },
      { label: 'Equipment', path: '/about/equipment' },
    ],
  },
  { label: 'Services', path: '/services' },
  { label: 'Projects', path: '/projects' },
  { label: 'Contact Us', path: '/contact' },
];

const NavItem = ({ label, path, items }: NavItemProps) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isActive = path
    ? location.pathname === path || location.pathname.startsWith(path + '/')
    : false;

  if (!items) {
    return (
      <Link
        to={path!}
        className={`block py-1.5 px-4 rounded-md font-semibold text-sm transition-colors duration-150 ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100 hover:text-blue-900'
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 py-1.5 px-4 rounded-md w-full md:w-auto font-semibold text-sm transition-colors duration-150 ${
          isActive 
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100 hover:text-blue-900'
        }`}
      >
        {label}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 10 6"
          aria-hidden="true"
        >
          <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M1 1l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-48 border border-gray-100">
          <ul className="py-2 text-sm text-gray-700">
            {items.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 font-medium hover:bg-teal-50 hover:text-teal-700 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-6 py-3">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 w-[260px] -ml-10">
          <img src={logo} alt="ITC Logo" className="h-10 w-10 rounded-full border border-gray-200" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-blue-900">Exploration Geophysics Lab</span>
          </div>
        </Link>

        {/* Desktop nav + search */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
          <button
            className="ml-2 p-1.5 text-gray-500 hover:text-blue-900 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M16.5 16.5l4 4" />
            </svg>
          </button>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 17 14" aria-hidden="true">
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              d="M1 1h15M1 7h15M1 13h15" />
          </svg>
        </button>

        {/* Mobile menu */}
        <div className={`${mobileOpen ? 'block' : 'hidden'} w-full md:hidden`}>
          <ul className="flex flex-col gap-1 mt-3 pt-3 border-t border-gray-100">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <NavItem {...item} />
              </li>
            ))}
          </ul>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;