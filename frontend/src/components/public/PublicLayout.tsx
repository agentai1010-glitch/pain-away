import { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import "@/pages/landing/landing.css";

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Products", href: "/products" },
    { label: "Sign In", href: "/login" },
  ];

  return (
    <div className="font-sans antialiased min-h-screen bg-white">
      {/* ═══ NAVBAR ═══ */}
      <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="w-full h-16 px-8 md:px-12 lg:px-24 flex items-center justify-between relative">
          {/* Logo */}
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 z-[110]">
            <img 
              src="/images/logo-white.png" 
              alt="Pain Away" 
              className={`h-[12.5rem] w-auto transition-all duration-300 ${!scrolled && location.pathname === '/' ? 'brightness-0 invert drop-shadow-2xl' : 'drop-shadow-none scale-[0.6] -ml-8'}`} 
            />
          </Link>

          {/* Desktop Nav */}
          <div className="desktop-nav hidden md:flex items-center gap-8 z-[110]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`nav-link ${location.pathname === link.href ? 'active opacity-100 font-bold' : 'opacity-80 hover:opacity-100'}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/book"
              className="nav-cta"
            >
              Book Appointment
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`mobile-menu-btn md:hidden z-[110] ${mobileMenuOpen ? "open" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      <div className={`mobile-nav-overlay ${mobileMenuOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            onClick={() => setMobileMenuOpen(false)}
            className={location.pathname === link.href ? 'font-bold' : ''}
          >
            {link.label}
          </Link>
        ))}
        <Link
          to="/book"
          className="nav-cta mt-4"
          onClick={() => setMobileMenuOpen(false)}
        >
          Book Appointment
        </Link>
      </div>

      {/* Page Content */}
      <main className={location.pathname === '/' ? '' : 'pt-24 px-8 md:px-12 lg:px-24'}>
        <Outlet />
      </main>
    </div>
  );
}
