import { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import "@/pages/landing/landing.css";

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem("patient_token"));
    };
    checkAuth();
    window.addEventListener("patient_auth_changed", checkAuth);
    return () => window.removeEventListener("patient_auth_changed", checkAuth);
  }, []);

  const handleScroll = () => setScrolled(window.scrollY > 50);
  useEffect(() => {
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
  ];

  return (
    <div className="font-sans antialiased min-h-screen bg-white">
      {/* ═══ NAVBAR ═══ */}
      <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="w-full h-16 px-8 md:px-12 lg:px-24 flex items-center justify-end relative">
          {/* Logo */}
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="absolute left-8 md:left-12 lg:left-24 top-0 flex items-center gap-2 z-[110]">
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
            
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="nav-link flex items-center gap-2 opacity-80 hover:opacity-100 p-2 cursor-pointer"
                title="Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>Profile</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className={`nav-link ${location.pathname === '/login' ? 'active opacity-100 font-bold' : 'opacity-80 hover:opacity-100'}`}
              >
                Sign In
              </Link>
            )}

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
        
        {isAuthenticated ? (
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={location.pathname === '/profile' ? 'font-bold flex items-center gap-2 justify-center' : 'flex items-center gap-2 justify-center'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Profile
          </Link>
        ) : (
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className={location.pathname === '/login' ? 'font-bold' : ''}
          >
            Sign In
          </Link>
        )}

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
