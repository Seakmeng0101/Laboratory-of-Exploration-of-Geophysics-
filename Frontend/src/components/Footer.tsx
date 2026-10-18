import React from 'react';

/* ------------------------------------------------------------------ */
/* Icons                                                                */
/* ------------------------------------------------------------------ */

const PinIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.3 21 3 13.7 3 4.9c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.2 1L6.6 10.8Z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm16 4.2-8 5.3-8-5.3V18h16V8.2ZM4.4 6l7.6 5 7.6-5H4.4Z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21.9 4.3 18.7 20c-.2.9-.9 1.1-1.7.7l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.1l-4.8-1.5c-1-.3-1-1 .2-1.5L20.6 3.2c.8-.3 1.6.2 1.3 1.1Z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.4 20.4h-3.5v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.6H9.5V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.3-1.8 3.6 0 4.1 2.4 4.1 5.4v6.2ZM5.3 7.4a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM7 20.4H3.6V9H7v11.4Z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Footer                                                               */
/* ------------------------------------------------------------------ */

export interface FooterProps {
  address?: string;
  phone?: string;
  email?: string;
  facebookUrl?: string;
  telegramUrl?: string;
  linkedInUrl?: string;
}

const Footer = ({
  address = 'Room 405I, building I, Institute of technology of Cambodia,  Russian Federation Boulevard, Phnom Penh, Cambodia',
  phone = '+855 87550501 & +855 85818336',
  email = 'leg.ggg.itc@gmail.com',
  facebookUrl = 'https://www.facebook.com/share/1C49f1S1tz/',
  telegramUrl = 'https://t.me/MuoyYiGeophysicist',
  linkedInUrl = 'https://www.linkedin.com/company/laboratory-of-exploration-geophysics-ggg-itc/',
}: FooterProps) => {
  return (
    <footer className="bg-[#2A94B8] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Find us */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E03B3B]">
              <PinIcon />
            </span>
            <h3 className="font-semibold text-base">Find us</h3>
          </div>
          <p className="text-sm text-white/85 leading-relaxed">{address}</p>
        </div>

        {/* Call us */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E03B3B]">
              <PhoneIcon />
            </span>
            <h3 className="font-semibold text-base">Call us</h3>
          </div>
          <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-sm text-white/85 hover:text-white">
            {phone}
          </a>
        </div>

        {/* Email us */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E03B3B]">
              <MailIcon />
            </span>
            <h3 className="font-semibold text-base">Email us</h3>
          </div>
          <a href={`mailto:${email}`} className="text-sm text-white/85 hover:text-white">
            {email}
          </a>
        </div>
      </div>

      {/* Social icons */}
      <div className="max-w-6xl mx-auto px-6 pb-6 flex gap-3">
        <a
          href={facebookUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Facebook"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1877F2] hover:opacity-90 transition-opacity"
        >
          <FacebookIcon />
        </a>
        <a
          href={telegramUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Telegram"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#29A9EA] hover:opacity-90 transition-opacity"
        >
          <TelegramIcon />
        </a>
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0A66C2] hover:opacity-90 transition-opacity"
        >
          <LinkedInIcon />
        </a>
      </div>

      <div className="h-1 bg-black" />
    </footer>
  );
};

export default Footer;
