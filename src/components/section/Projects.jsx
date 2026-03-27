import "./css/projects.css";
import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { Github, ExternalLink, Activity, Code, ChevronLeft, ChevronRight } from "lucide-react";

import netflix1 from "../../assets/netflix/netflix_page-0001.jpg";
import netflix2 from "../../assets/netflix/netflix_page-0002.jpg";
import netflix3 from "../../assets/netflix/netflix_page-0003.jpg";
import netflix4 from "../../assets/netflix/netflix_page-0004.jpg";
import netflix5 from "../../assets/netflix/netflix_page-0005.jpg";
import netflix6 from "../../assets/netflix/netflix_page-0006.jpg";
import netflix7 from "../../assets/netflix/netflix_page-0007.jpg";
import netflix8 from "../../assets/netflix/netflix_page-0008.jpg";

import walmart1 from "../../assets/walmart/walmart sales analysis_page-0001.jpg";
import walmart2 from "../../assets/walmart/walmart sales analysis_page-0002.jpg";
import walmart3 from "../../assets/walmart/walmart sales analysis_page-0003.jpg";
import walmart4 from "../../assets/walmart/walmart sales analysis_page-0004.jpg";
import walmart5 from "../../assets/walmart/walmart sales analysis_page-0005.jpg";

/* ================= PROJECT DATA ================= */
const PROJECTS = [
  {
    title: "The Billing Software",
    type: "Python with GUI",
    icon: Code,
    description:
      "Billing Software using Python with GUI. Generates PDF bills and stores history in Excel.",
    tags: ["Python", "GUI", "PDF", "Excel"],
    code: "https://github.com/Hemanth509h/The_Billing_Software.git",
    demo: "", 
    category: "Full Stack & Web Apps",
  },
  {
    title: "Login & Register (MongoDB)",
    type: "Python + MongoDB",
    icon: Code,
    description:
      "Secure login/register system using Flask and MongoDB with authentication.",
    tags: ["Python", "MongoDB", "HTML", "JavaScript"],
    code: "https://github.com/Hemanth509h/login_an_register.git",
    demo: "https://loginregisterpages.vercel.app/",
    category: "Full Stack & Web Apps",
  },
  {
    title: "Grocery Management System",
    type: "Full Stack",
    icon: Code,
    description:
      "Full stack grocery system with billing, database storage and UI.",
    tags: ["Python", "Flask", "MySQL", "JavaScript"],
    code: "https://github.com/Hemanth509h/Grocerly-Management-System.git",
    demo: "https://elitegrocers.vercel.app/",
    category: "Full Stack & Web Apps",
  },
  {
    title: "Trendcast",
    type: "React + Python",
    icon: Code,
    description:
      "Twitter trend analysis app with real-time data visualization.",
    tags: ["React", "Python", "Data Analysis"],
    code: "https://github.com/Hemanth509h/Trendcast.git",
    demo: "https://trendcasts.vercel.app/",
    category: "Full Stack & Web Apps",
  },
  {
    title: "Netflix Data Analysis",
    type: "Power BI",
    icon: Activity,
    images: [netflix1, netflix2, netflix3, netflix4, netflix5, netflix6, netflix7, netflix8],
    description: "EDA and visualization on Netflix dataset.",
    tags: ["Power BI", "Data Analysis"],
    code: "https://github.com/Hemanth509h/Data-analysis/tree/main/netflix%20analysis",
    demo: "",
    category: "Data Analysis",
  },
  {
    title: "Walmart Data Analysis",
    type: "Power BI",
    icon: Activity,
    images: [walmart1, walmart2, walmart3, walmart4, walmart5],
    description: "EDA and visualization on Walmart dataset.",
    tags: ["Power BI", "Data Analysis"],
    code: "https://github.com/Hemanth509h/Data-analysis/tree/main/walmart%20analysis",
    demo: "",
    category: "Data Analysis",
  },
];

/* ================= GROUP ================= */
const groupedProjects = PROJECTS.reduce((acc, project) => {
  if (!acc[project.category]) acc[project.category] = [];
  acc[project.category].push(project);
  return acc;
}, {});

Object.keys(groupedProjects).forEach((key) => {
  groupedProjects[key].reverse();
});

/* ================= IMAGE SLIDER ================= */
function ImageSlider({ images, title }) {
  const [current, setCurrent] = useState(0);

  const prev = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c - 1 + images.length) % images.length);
  };

  const next = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c + 1) % images.length);
  };

  return (
    <div className="slider">
      <img src={images[current]} alt={title} className="slider-img" />

      <button className="slider-btn slider-btn-left" onClick={prev}>
        <ChevronLeft size={18} />
      </button>

      <button className="slider-btn slider-btn-right" onClick={next}>
        <ChevronRight size={18} />
      </button>

      <div className="slider-dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`slider-dot ${i === current ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrent(i);
            }}
          />
        ))}
      </div>

      <span className="slider-counter">
        {current + 1} / {images.length}
      </span>
    </div>
  );
}
import { motion as Motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";

/* ================= ANIMATION VARIANTS ================= */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

/* ================= COMPONENT ================= */
export function Projects() {
  return (
    <Motion.section
      className="projectssection"
      id="projects"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* HEADER */}
      <div className="projects-description">
        <Motion.h1
          className="projects-title"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Featured Work
        </Motion.h1>

        <Motion.p
          className="projects-description2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          My full stack & data analysis projects
        </Motion.p>
      </div>

      {/* PROJECT GROUPS */}
      {Object.entries(groupedProjects).map(([category, projects]) => (
        <div key={category} className="category-section">
          
          {/* CATEGORY TITLE */}
          <Motion.h2
            className="category-title"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {category}
          </Motion.h2>

          {/* PROJECT CARDS */}
          <div className="projects-container">
            {projects.map((project, index) => (
              <Motion.div
                key={index}
                className="project-card"
                variants={cardVariants}
                whileHover={{ scale: 1.05 }}
              >
                {/* IMAGE SLIDER */}
                {project.images && (
                  <ImageSlider
                    images={project.images}
                    title={project.title}
                  />
                )}

                {/* HEADER */}
                <div className="project-header">
                  <project.icon size={22} />
                  <span className="project-type">
                    {project.type}
                  </span>
                </div>

                {/* TITLE */}
                <h3 className="project-title">
                  {project.title}
                </h3>

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

                  <a
                    href={project.demo || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`project-link ${
                      !project.demo ? "disabled" : ""
                    }`}
                  >
                    <ExternalLink size={16} /> Demo
                  </a>
                </div>
              </Motion.div>
            ))}
          </div>
        </div>
      ))}
    </Motion.section>
  );
}
