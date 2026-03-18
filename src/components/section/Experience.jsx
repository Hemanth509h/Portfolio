import "./css/Experience.css";
import { motion as Motion } from "framer-motion";
import { Briefcase } from "lucide-react";

const EXPERIENCES = [
  {
    role: "Senior Full Stack Developer",
    company: "TechCorp",
    period: "2022 - Present",
    description: [
      "Architected and deployed microservices-based web applications scaling to 1M+ daily active users.",
      "Mentored junior developers and established CI/CD best practices reducing deployment time by 40%.",
      "Integrated complex third-party payment and CRM APIs ensuring 99.99% uptime.",
    ],
  },
  {
    role: "Data Analyst",
    company: "DataInsights Inc",
    period: "2020 - 2022",
    description: [
      "Built automated Python ETL pipelines to aggregate disparate marketing data into central warehouses.",
      "Created interactive Tableau dashboards utilized by C-suite for quarterly strategic planning.",
      "Developed regression models to forecast seasonal demand, improving inventory efficiency by 15%.",
    ],
  },
  {
    role: "Junior Web Developer",
    company: "StartupHub",
    period: "2019 - 2020",
    description: [
      "Developed responsive landing pages and internal admin tools using React and Express.",
      "Optimized legacy database queries, reducing average load times on core views by 2 seconds.",
      "Collaborated tightly with UX designers to implement pixel-perfect, accessible interfaces.",
    ],
  },
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
