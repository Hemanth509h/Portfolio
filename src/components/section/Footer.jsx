import { Terminal } from "lucide-react";

export function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-container">

          <div className="footer-left">
            <Terminal className="footer-icon" />
            <span className="footer-logo">
              Alex<span className="highlight">.dev</span>
            </span>
          </div>

          <p className="footer-text">
            © {new Date().getFullYear()} Alex Johnson. All rights reserved.
          </p>

        </div>
      </footer>

      {/* ================= CSS ================= */}
      <style>{`
        .footer {
          padding: 40px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: #020617;
          color: white;
        }

        .footer-container {
          max-width: 1200px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer-icon {
          width: 20px;
          height: 20px;
          color: #38bdf8;
        }

        .footer-logo {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .highlight {
          color: #38bdf8;
        }

        .footer-text {
          font-size: 14px;
          color: #94a3b8;
          text-align: center;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .footer-container {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}