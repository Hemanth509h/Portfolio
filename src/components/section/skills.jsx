import "./css/skills.css";
import { motion as Motion } from "framer-motion";

const SKILL_CATEGORIES = [
  {
    title: "Full Stack Development",
    skills: ["React", "Node.js", "Next.js", "MongoDB", "Supabase", "Docker"],
  },
  {
    title: "Data Analysis & ML",
    skills: ["Python", "SQL", "Power BI", "Jupyter", "Statistical Analysis"],
  },
];

export function Skills() {
  return (
    <section className="skillssection" id="skills">
      <Motion.h1
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="Technical-Arsenal"
        viewport={{
          once: true,
        }}
      >
        Technical Arsenal
      </Motion.h1>
      <Motion.p
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
         viewport={{
                    once: true,
                  }}
        className="skills-description"
      >
        The tools and technologies I use to bring ideas to life.
      </Motion.p>

      <div className="skills-grid">
        {SKILL_CATEGORIES.map((category, idx) => (
          <Motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.5,
              delay: idx * 0.2,
            }}
            className="skillscard"
          >
            <h3>
              <hr />
              {category.title}
              <hr />
            </h3>
            <div className="skillslist">
              {category.skills.map((skill, sIdx) => (
                <Motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: idx * 0.2 + sIdx * 0.05,
                  }}
                  whileHover={{
                    y: -3,
                    scale: 1.05,
                  }}
                  className="skillitem"
                >
                  {skill}
                </Motion.div>
              ))}
            </div>
          </Motion.div>
        ))}
      </div>
    </section>
  );
}
