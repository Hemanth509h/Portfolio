import './css/projects.css';
import { motion as Motion } from 'framer-motion';
export function Projects() {
  return <section className="projectssection">
    <div className="projects-description">
    <Motion.h1
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="projects-title"
        viewport={{
          once: true,
        }}
       
    >Featured Work</Motion.h1>
    <Motion.p
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{
          once: true,
        }}
        className="projects-description2"
    >
      A selection of my recent full stack applications and data analysis projects.
    </Motion.p>
    </div>
  </section>;
}
