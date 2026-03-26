import "./css/Experience.css";
import { motion as Motion } from "framer-motion";
import { Briefcase } from "lucide-react";

const EXPERIENCES = [
  {
    role: "Diploma Industrial Training",
    company: "The National Small Industries Corporation (NSIC) Technology service Centre, Hyderabad",
    period: "05/2024 - 10/2024",
    description: [
      "Gained hands-on experience in the field of Computer Science and Engineering through a comprehensive 6-month industrial training program at NSIC Technology Service Centre, Hyderabad.",
      "Collaborated with industry professionals, gaining insights into the latest technologies and industry practices, and enhanced my understanding of the software development lifecycle.",
    ],
  },
   {
    role: "Web Development",
    company: "INFOTACT SOLUTIONS",
    period: "03/2026 - 06/2026",
    description: [
    "Selected as an Associate L1 intern at Infotact Solutions in a fully remote role, working on real-world web development projects.",
    "Collaborating with the development team to design, develop, test, and deploy responsive web applications based on project requirements.",
    "Writing clean, efficient, and maintainable code using technologies such as HTML, CSS, JavaScript, React.js, and Node.js.",
    "Participating in code reviews, debugging issues, and optimizing performance to ensure high-quality user experience.",
    "Gaining hands-on experience with modern development workflows, APIs, and system design while working in a professional environment.",
    "Providing weekly progress updates and continuously improving skills through learning new tools, frameworks, and best practices."
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
        viewport={true}
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
