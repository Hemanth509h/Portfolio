import { useState, useEffect } from "react";
import { Menu, X, Terminal } from "lucide-react";
import "./css/navbar.css";

const NAV_LINKS = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Contact", href: "#contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`header ${isScrolled ? "header-scrolled" : "header-top"}`}
    >
      <div className="container">
        <div className="inner-row">
          {/* Logo */}
          <a href="#" className="logo-link">
            <div className="logo-icon">
              <Terminal className="logo-svg" />
            </div>
            <span className="logo-text">
              Hemanth<span className="logo-accent">.dev</span>
            </span>
          </a>

          {/* Desktop Nav */}
          {isMenuOpen && (
            <div className="mobile-nav">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}

              <a
                href="#contact"
                className="mobile-hire-btn"
                onClick={() => setIsMenuOpen(false)}
              >
                Hire Me
              </a>
            </div>
          )}

          <div
            className="mobile-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="menu-icon" />
            ) : (
              <Menu className="menu-icon" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
