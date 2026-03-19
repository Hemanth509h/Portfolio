import "./css/projects.css";
import { motion as Motion } from "framer-motion";
import { Github, ExternalLink, Activity, Code } from "lucide-react";

/* ================= PROJECT DATA ================= */
const PROJECTS = [
  {
    title: "The Billing Software",
    type: "Python with GUI",
    icon: Code,
    description:
      "Billing Software using Python GUI with PDF generation and Excel-based bill history.",
    tags: ["Python", "GUI", "PDF", "Excel"],
    code: "https://github.com/Hemanth509h/The_Billing_Software.git",
    demo: "",
    category: "Full Stack & Web Apps",
  },
  {
    title: "Grocery Management System",
    type: "Full Stack using Python",
    icon: Code,
    description:
      "Online grocery platform with user login, cart, admin dashboard and MySQL database.",
    tags: ["Python", "Flask", "Jinja2", "JavaScript", "MySQL"],
    code: "https://github.com/Hemanth509h/Grocerly-Management-System.git",
    demo: "",
    category: "Full Stack & Web Apps",
  },
  {
    title: "Trendcast",
    type: "React + Python",
    icon: Code,
    description:
      "Web app to analyze Walmart dataset trends with React frontend and Python backend.",
    tags: ["React", "Python", "Data Analysis"],
    code: "https://github.com/Hemanth509h/Trendcast.git",
    demo: "",
    category: "Full Stack & Web Apps",
  },
  {
    title: "Netflix Data Analysis",
    type: "Power Bi",
    icon: Activity,
    description:
      "Performed EDA, visualization, and statistical analysis on Netflix dataset.",
    tags: ["Power Bi", "Data Analysis", "Visualization"],
    code: "https://github.com/Hemanth509h/Data-analysis/tree/main/netflix%20analysis",
    demo: "",
    category: "Data Analysis",
  },
   {
    title: "Walmart Data Analysis",
    type: "Power Bi",
    icon: Activity,
    description:
      "Performed EDA, visualization, and statistical analysis on Walmart dataset.",
    tags: ["Power Bi", "Data Analysis", "Visualization"],
    code: "https://github.com/Hemanth509h/Data-analysis/tree/main/walmart%20analysis",
    demo: "",
    category: "Data Analysis",
  },
];


const groupedProjects = PROJECTS.reduce((acc, project) => {
  if (!acc[project.category]) acc[project.category] = [];
  acc[project.category].push(project);
  return acc;
}, {});

/* ================= COMPONENT ================= */
export function Projects() {
  return (
    <section className="projectssection" id="projects">
      {/* TITLE */}
      <div className="projects-description">
        <Motion.h1
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="projects-title"
        >
          Featured Work
        </Motion.h1>

        <Motion.p
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="projects-description2"
        >
          A selection of my full stack applications and data analysis projects.
        </Motion.p>
      </div>

      {/* PROJECTS */}
      {Object.entries(groupedProjects).map(([category, projects]) => (
        <div key={category} className="category-section">
          <h2 className="category-title">{category}</h2>

          <div className="projects-container">
            {projects.map((project, index) => (
              <Motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="project-card"
              >
                {/* HEADER */}
                <div className="project-header">
                  <project.icon size={22} />
                  <span className="project-type">{project.type}</span>
                </div>

                {/* TITLE */}
                <h3 className="project-title">{project.title}</h3>

                {/* DESCRIPTION */}
                <p className="project-description">
                  {project.description}
                </p>

                {/* TAGS */}
                <div className="project-tags">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="project-tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <hr />

                {/* FOOTER */}
                <div className="project-footer">
                  <a
                    href={project.code}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    <Github size={16} /> Code
                  </a>

                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      <ExternalLink size={16} /> Demo
                    </a>
                  )}
                </div>
              </Motion.div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}