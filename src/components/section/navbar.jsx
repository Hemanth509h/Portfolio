import { useState, useEffect } from "react";
import { Menu, X, Terminal } from "lucide-react";

const NAV_LINKS = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Contact", href: "#contact" },
];

const styles = {
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    transition: "all 0.3s ease",
    borderBottom: "1px solid transparent",
  },
  headerScrolled: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    padding: "12px 0",
  },
  headerTop: {
    background: "transparent",
    padding: "20px 0",
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 16px",
  },
  innerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",},
  logoLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
  },
  logoIcon: {
    padding: "8px",
    background: "rgba(99, 102, 241, 0.1)",
    borderRadius: "8px",
    transition: "background 0.2s",
  },
  logoText: {
    fontWeight: "bold",
    fontSize: "20px",
    letterSpacing: "-0.5px",
    color: "#aaaaaa",
  },
  logoAccent: {
    color: "#38bdf8",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "32px",
  },
  navLink: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#6b7280",
    textDecoration: "none",
    transition: "color 0.2s",
  },
  hireBtn: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: 500,
    borderRadius: "9999px",
    background: "rgba(99, 102, 241, 0.1)",
    color: "#6366f1",
    border: "1px solid rgba(99, 102, 241, 0.2)",
    textDecoration: "none",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  menuBtn: {
    padding: "8px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
  },
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      style={{
        ...styles.header,
        ...(isScrolled ? styles.headerScrolled : styles.headerTop),
      }}
    >
      <div style={styles.container}>
        <div style={styles.innerRow}>
          {/* Logo */}
          <a href="#" style={styles.logoLink}>
            <div style={styles.logoIcon}>
              <Terminal style={{ width: 24, height: 24, color: "#6366f1" }} />
            </div>
            <span style={styles.logoText}>
              Hemanth<span style={styles.logoAccent}>.dev</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav style={styles.nav}>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={styles.navLink}
                onMouseEnter={(e) => {
                  e.target.style.color = "#6366f1";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#6b7280";
                }}
              >
                {link.name}
              </a>
            ))}

            <a
              href="#contact"
              style={styles.hireBtn}
              onMouseEnter={(e) => {
                e.target.style.background = "#6366f1";
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(99, 102, 241, 0.1)";
                e.target.style.color = "#6366f1";
              }}
            >
              Hire Me
            </a>
          </nav>

         
        </div>
      </div>
    </header>
  );
}
