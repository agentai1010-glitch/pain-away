import { useScrollReveal } from "@/hooks/useScrollReveal";
import "./landing.css";

/* ─── SVG Icons ─── */
const BackPainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M12 2C10.34 2 9 3.34 9 5s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    <path d="M10 10c-2 0-4 1-4 3v2h2l1 7h6l1-7h2v-2c0-2-2-3-4-3" />
  </svg>
);

const NeckPainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <circle cx="12" cy="5" r="3" />
    <path d="M12 8v4M8 12c0-2 1.5-3 4-3s4 1 4 3" />
    <path d="M9 14l-1 8M15 14l1 8M10 18h4" />
  </svg>
);

const SportsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M13 4v16M7 4l6 4-6 4" />
    <circle cx="17" cy="18" r="2" />
    <path d="M17 16V8" />
  </svg>
);

const PostureIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <circle cx="12" cy="4" r="2.5" />
    <path d="M12 6.5v5.5M12 12l-4 4M12 12l4 4M12 12v6M10 22h4" />
  </svg>
);

const MobilityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M4 12h16M12 4v16M7 7l10 10M17 7L7 17" />
  </svg>
);

const PackageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M21 8L12 2 3 8v8l9 6 9-6V8z" />
    <path d="M12 22V12M12 12L3 8M12 12l9-4" />
  </svg>
);



const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
    <path d="M8 2v16M16 6v16" />
  </svg>
);

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

/* ─── Data ─── */
const services = [
  {
    title: "Back Pain Treatment",
    desc: "Relieve lower and upper back pain with targeted therapy.",
    icon: <BackPainIcon />,
  },
  {
    title: "Neck Pain Treatment",
    desc: "Effective care for neck stiffness and cervical issues.",
    icon: <NeckPainIcon />,
  },
  {
    title: "Sports Injury Rehabilitation",
    desc: "Recover faster and return to the sport you love.",
    icon: <SportsIcon />,
  },
  {
    title: "Posture Correction",
    desc: "Improve posture, reduce pain and prevent injuries.",
    icon: <PostureIcon />,
  },
  {
    title: "Mobility & Flexibility",
    desc: "Enhance movement, flexibility and overall physical function.",
    icon: <MobilityIcon />,
  },
  {
    title: "Special Packages",
    desc: "Customized therapy packages for your unique needs.",
    icon: <PackageIcon />,
  },
];





/* ─── Component ─── */
export default function LandingPage() {
  const containerRef = useScrollReveal();

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={containerRef} className="font-sans antialiased">
      {/* ═══ SECTION 1: HERO ═══ */}
      <section id="hero" className="hero-section">
        <div className="hero-bg">
          <img src="/images/hero-poster.jpg" alt="Pain Away Clinic" />
        </div>
        <div className="hero-overlay" />
        <div className="hero-content w-full px-8 md:px-12 lg:px-24 py-32 md:py-0">
          <div className="max-w-2xl">
            <h1 className="hero-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
              Relieve <span style={{ color: "var(--pa-yellow)" }}>Pain</span>.
              <br />
              Restore <span style={{ color: "var(--pa-yellow)" }}>Movement</span>.
              <br />
              Rebuild <span style={{ color: "var(--pa-yellow)" }}>Life</span>.
            </h1>
            <p className="hero-subtext text-lg md:text-xl text-white/80 mt-6 max-w-lg leading-relaxed">
              Expert physiotherapy care designed to help you move better, feel stronger, and live pain-free.
            </p>
            <div className="hero-cta flex flex-wrap gap-4 mt-10">
              <a href="/book" className="btn-primary-landing">
                Book Appointment <ArrowRight />
              </a>
              <a
                href="#services"
                onClick={(e) => { e.preventDefault(); scrollToSection("#services"); }}
                className="btn-secondary-landing"
              >
                Explore Services <ArrowRight />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: SERVICES ═══ */}
      <section id="services" className="py-20 md:py-28" style={{ background: "var(--pa-blue-tint)" }}>
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-[1920px] mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="section-label">
              Our Services
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mt-4 tracking-tight" style={{ color: "var(--pa-navy)" }}>
              Care Tailored For Your{" "}
              <span style={{ color: "var(--pa-blue-bright)" }}>Recovery</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
            {services.map((svc, i) => (
              <div key={svc.title} className={`service-card reveal reveal-delay-${i + 1}`}>
                <div className="service-card-icon">
                  {svc.icon}
                </div>
                <h3 className="text-sm md:text-base font-bold mb-2" style={{ color: "var(--pa-navy)" }}>{svc.title}</h3>
                <p className="text-xs md:text-sm leading-relaxed" style={{ color: "var(--pa-gray-500)" }}>{svc.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 reveal">
            <a
              href="#services"
              className="inline-flex items-center gap-2 font-semibold text-sm tracking-wide transition-all hover:gap-3"
              style={{ color: "var(--pa-blue-bright)" }}
            >
              View All Services <ArrowRight />
            </a>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: TREATMENT EXPERIENCE ═══ */}
      <section id="treatment" className="w-full bg-[#002b84]">
        <img
          src="/images/section3-new-bg.jpg"
          alt="Treatment sessions at Pain Away clinic"
          loading="lazy"
          className="w-full h-auto block"
        />
      </section>

      {/* ═══ SECTION 4: VISIT US ═══ */}
      <section id="visit" className="py-20 md:py-28" style={{ background: "var(--pa-blue-tint)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 reveal">
            <span className="section-label">
              Visit Us
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mt-4 tracking-tight" style={{ color: "var(--pa-navy)" }}>
              Come Visit Our Clinic
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Timings */}
            <div className="visit-card reveal reveal-delay-1">
              <div className="visit-card-icon">
                <ClockIcon />
              </div>
              <h3 className="font-bold text-lg mb-3" style={{ color: "var(--pa-navy)" }}>Timings</h3>
              <p className="text-base font-semibold" style={{ color: "var(--pa-blue-bright)" }}>12:00 PM – 7:00 PM</p>
              <p className="text-sm mt-1" style={{ color: "var(--pa-gray-500)" }}>Wednesday Off</p>
            </div>

            {/* Appointment Booking */}
            <div className="visit-card reveal reveal-delay-2">
              <div className="visit-card-icon">
                <PhoneIcon />
              </div>
              <h3 className="font-bold text-lg mb-3" style={{ color: "var(--pa-navy)" }}>Appointment Booking</h3>
              <a
                href="tel:9096272792"
                className="text-xl font-bold transition-colors hover:underline"
                style={{ color: "var(--pa-blue-bright)" }}
              >
                9096272792
              </a>
            </div>

            {/* Address */}
            <div className="visit-card reveal reveal-delay-3">
              <div className="visit-card-icon">
                <LocationIcon />
              </div>
              <h3 className="font-bold text-lg mb-3" style={{ color: "var(--pa-navy)" }}>Our Location</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--pa-gray-500)" }}>
                Sr No 15/7 Bhuleshwar Hos. Society,
                <br />Pune Satara Road, K.K. Market,
                <br />Near Lilly's Garden Hotel,
                <br />Balaji Nagar, Dhankawadi,
                <br />Pune, Maharashtra 411043
              </p>
            </div>

            {/* Google Map */}
            <div className="visit-card reveal reveal-delay-4">
              <div className="visit-card-icon">
                <MapIcon />
              </div>
              <h3 className="font-bold text-lg mb-3" style={{ color: "var(--pa-navy)" }}>Google Map Location</h3>
              <div className="map-container mb-4">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.1!2d73.8567!3d18.4655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2eaf7e4cf5e49%3A0x7e5b7e4a4c0e7a0!2sPain+Away+Physiotherapy!5e0!3m2!1sen!2sin!4v1"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Pain Away Clinic Location"
                ></iframe>
              </div>
              <a
                href="https://maps.app.goo.gl/painaway"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5"
                style={{ color: "var(--pa-blue-bright)" }}
              >
                View on Google Maps
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="landing-footer py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center gap-8">
            {/* Logo */}
            <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection("#hero"); }} className="inline-block">
              <img src="/images/logo-white.png" alt="Pain Away" className="h-[12.5rem] w-auto brightness-0 invert" />
            </a>

            {/* Tagline */}
            <p className="text-white/60 text-base md:text-lg font-medium tracking-wide">
              Relieve <span style={{ color: "var(--pa-yellow)" }}>Pain</span> •{" "}
              Restore <span style={{ color: "var(--pa-yellow)" }}>Movement</span> •{" "}
              Rebuild <span style={{ color: "var(--pa-yellow)" }}>Life</span>
            </p>

            {/* Divider */}
            <div className="w-24 h-px bg-white/20" />

            {/* Social Icons */}
            <div className="flex gap-4">
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Follow us on Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Follow us on Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="https://wa.me/919096272792" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Chat on WhatsApp">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>

            {/* Copyright */}
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} Pain Away Physiotherapy Clinic. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
