import "./css/Experience.css";
import { motion as Motion } from "framer-motion";
import { Briefcase } from "lucide-react";

const EXPERIENCES = [
  
];

export function Experience() {
  return (
    <section className="experience-section" id="experience">
      <Motion.div
        className="experience-container"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="experience-heading">Experience</h1>
      </Motion.div>

      <div className="experience-content">
        {EXPERIENCES.map((exp, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <Motion.div
              key={idx}
              className={`timeline-item ${isEven ? "reverse" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Icon */}
              <div className="timeline-icon">
                <Briefcase className="icon" />
              </div>

              {/* Card */}
              <div className="timeline-content">
                <div className="card">
                  <div className="card-header">
                    <h4>{exp.role}</h4>
                    <span className="period">{exp.period}</span>
                  </div>

                  <h5 className="company">{exp.company}</h5>

                  <ul>
                    {exp.description.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Motion.div>
          );
        })}
      </div>
    </section>
  );
}
