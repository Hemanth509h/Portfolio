import "./css/projects.css";
import { motion as Motion } from "framer-motion";
import { Github, ExternalLink, Activity, Server,Code } from "lucide-react";

const PROJECTS = [
  {
    title: "The Billing Software",
    type: "Python with GUI",
    icon: Code,
    description:
      "Billing Software using Python with GUI: This project includes features for managing customer bills with a user-friendly interface. Each bill is saved as a PDF for printing and record-keeping, while the complete bill history is stored in an Excel file for easy access and analysis.",
    tags: ["Python", "GUI", "PDF Generation", "Excel Integration"],
    code: "https://github.com/Hemanth509h/The_Billing_Software.git",
    demo: "",
  },
 {
    title: "Grocerly Management System",
    type: "Full Stack using Python",
    icon: Code,
    description:
      "Grocerly is a modern web application for online grocery shopping and management. It offers user registration, product browsing, cart and order features, and admin/distributor dashboards. Built with Python, Jinja2, and JavaScript, Grocerly streamlines grocery store operations and enhances customer experience.",
    tags: ["Python", "Flask", "Jinja2", "JavaScript", "MySQL"],
    code: "https://github.com/Hemanth509h/Grocerly-Management-System.git",
    demo: "",
  },
  {
    title: "Trendcast",
    type: "React and Python",
    icon: Code,
    description:
      "Trendcast is a web application that provides real-time insights into trending topics on WalMart dataset . It features a user-friendly interface built with React, allowing users to explore and analyze Walmart trends. The backend, developed in Python, fetches and processes Walmart data to deliver up-to-date trend information, making it a powerful tool for social media analysis.",
    tags: ["React", "Python", "Data Analysis", "Walmart Dataset"],
    code: "https://github.com/Hemanth509h/Trendcast.git",
    demo: "",
  },
  
  
];

export function Projects() {
  return (
    <section className="projectssection" id="projects">
      <div className="projects-description">
        <Motion.h1
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="projects-title"
          viewport={{ once: true }}
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
          A selection of my recent full stack applications and data analysis
          projects.
        </Motion.p>
      </div>

      <div className="projects-container">
        {[...PROJECTS].reverse().map((project, index) => (
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
              <project.icon size={24} />
              <span className="project-type">{project.type}</span>
            </div>

            {/* TITLE */}
            <h3 className="project-title">{project.title}</h3>

            {/* DESCRIPTION */}
            <p className="project-description">{project.description}</p>

            {/* TAGS */}
            <div className="project-tags">
              {project.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="project-tag">
                  {tag}
                </span>
              ))}
            </div>

            <hr />

            {/* FOOTER */}
            <div className="project-footer">
              <a
                href={project.code}
                className="project-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={16} /> Code
              </a>

              <a
                href={project.demo}
                className="project-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={16} /> Demo
              </a>
            </div>
          </Motion.div>
        ))}
      </div>
    </section>
  );
}