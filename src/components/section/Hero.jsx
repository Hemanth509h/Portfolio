import { motion as Motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import heroimage from "../../assets/hero-bg.png";
import "./css/hero.css";

export function HeroSection() {
  return (
    <section className="hero-section">

      <div
        className="hero-bg"
        style={{ backgroundImage: `url(${heroimage})` }}
      />

      <div className="hero-content">

        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="availability-badge"
        >
          <span className="badge-dot"></span>
          Available for new opportunities
        </Motion.div>

        <Motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-heading"
        >
          Hi, <br/>I'm <span>P Hemanth Kumar</span>
          <br />
          <span  style={{ color: "#38bdf8" }}>
          Full Stack <br/>Data Analyst
          </span>
        </Motion.h1>

        <Motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hero-description"
        >
          I build scalable web applications and uncover actionable insights from
          complex datasets. Bridging the gap between engineering and analytics.
        </Motion.p>

        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="hero-buttons"
        >
          <div className="buttons">
          <button className="btn btn1">View My Work
             <ArrowRight className="buttonarrowright" />
          </button>
          <button className="btn">Contact Me</button>
          </div>
        </Motion.div>
      </div>

      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="scroll-indicator"
      >
        <ChevronDown size={32} />
      </Motion.div>

    </section>
  );
}