import "./css/projects.css";
import { motion as Motion } from "framer-motion";
import { Github, ExternalLink, Activity, Server } from "lucide-react";

const PROJECTS = [
  {
    title: "E-Commerce Platform",
    type: "Full Stack",
    icon: Server,
    description:
      "A comprehensive scalable e-commerce solution featuring real-time inventory management, secure payments, and an intuitive admin dashboard.",
    tags: ["React", "Node.js", "PostgreSQL", "Stripe"],
  },
  {
    title: "Sales Data Dashboard",
    type: "Data Analysis",
    icon: Activity,
    description:
      "Interactive analytics dashboard processing millions of sales records to uncover actionable insights and regional performance metrics.",
    tags: ["Python", "Tableau", "SQL", "Pandas"],
    gradient: "from-cyan-500/20 to-emerald-500/20",
  },
  {
    title: "Real-Time Chat App",
    type: "Full Stack",
    icon: Server,
    description:
      "High-performance messaging application with end-to-end encryption, typing indicators, and media sharing capabilities.",
    tags: ["React", "WebSockets", "MongoDB", "Express"],
    gradient: "from-indigo-500/20 to-pink-500/20",
  },
  {
    title: "Customer Churn Prediction",
    type: "Machine Learning",
    icon: Activity,
    description:
      "Predictive ML model that identifies at-risk customers with 94% accuracy, helping retention teams proactively engage clients.",
    tags: ["Scikit-Learn", "Python", "Jupyter"],
  },
  {
    title: "Task Management API",
    type: "Full Stack",
    icon: Server,
    description:
      "Robust RESTful API for team productivity. Includes advanced RBAC, rate limiting, and comprehensive OpenAPI documentation.",
    tags: ["Node.js", "Docker", "Redis", "Jest"],
  },
  {
    title: "Market Trend Analyzer",
    type: "Data Analysis",
    icon: Activity,
    description:
      "Automated scraping and sentiment analysis tool for social media and news outlets to track emerging tech market trends.",
    tags: ["Python", "BeautifulSoup", "NLTK", "Matplotlib"],
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
          viewport={{
            once: true,
          }}
        >
          Featured Work
        </Motion.h1>
        <Motion.p
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{
            once: true,
          }}
          className="projects-description2"
        >
          A selection of my recent full stack applications and data analysis
          projects.
        </Motion.p>
      </div>

      
      <div className="projects-container">
        {PROJECTS.map((project, index) => (
          <Motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{
              once: true,
            }}
            className="project-card"
          >
            <div className="project-header">
              <project.icon size={24} />
              <span className="project-type">{project.type}</span>
            </div>
            <h3 className="project-title">{project.title}</h3>
            <p className="project-description">{project.description}</p>
            <div className="project-tags">
              {project.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="project-tag">
                  {tag}
                </span>
              ))}
            </div>
            <hr />
            <div className="project-footer">
              <a href="#" className="project-link">
                <Github size={16} /> Code
              </a>
              <a href="#" className="project-link">
                <ExternalLink size={16} /> Demo
              </a>
            </div>
          </Motion.div>
        ))}
      </div>
    </section>
  );
}
