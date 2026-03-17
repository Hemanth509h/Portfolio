import "./css/Aboutme.css";
import image from "../../assets/image.png";
import { motion as Motion } from "framer-motion";
import { Code2, Database, Layout, Terminal } from "lucide-react";

const stats = [
  {
    label: "Years Experience",
    value: "1+",
    icon: Terminal,
  },
  {
    label: "Projects Completed",
    value: "10+",
    icon: Layout,
  },
  {
    label: "Technologies",
    value: "10+",
    icon: Code2,
  },
  {
    label: "Data Pipelines",
    value: "20+",
    icon: Database,
  },
];

export function Aboutme() {
  return (
    <section className="aboutmesection">
      <div className="aboutmecontent">
        <Motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="about-heading"
        >
          <span style={{ color: "#38bdf8" }}>About Me</span>
        </Motion.h2>

        <Motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="about-description"
        >
          Passionate developer dedicated to building impactful digital solutions
          and deriving deep insights from data.
        </Motion.p>
      </div>

      <div className="aboutmecontainer">
        <Motion.img
          src={image}
          alt="About Me"
          initial={{ opacity: 0, translateX: -50 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="about-img"
        />

        <Motion.div
          initial={{ opacity: 0, translateX: +50 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="about-description2"
        >
          <h4>Bridging the gap between engineering and analytics.</h4>
          <p>
            I'm Alex, a Full Stack Developer & Data Analyst with over 5 years of
            experience building scalable web applications and complex data
            pipelines. My dual background allows me to architect robust backend
            systems while surfacing actionable insights.
          </p>
          <p>
            Whether it's designing a high-performance REST API, crafting a
            beautiful interactive UI, or training machine learning models to
            predict market trends, I bring a detail-oriented and holistic
            approach to every project I touch.
          </p>
          <div className="stats">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
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
                    delay: 0.4 + i * 0.1,
                  }}
                  className="stats-card"
                  
                >
                  <Icon className="statsicon"/>
                  <span className="statsvalue">
                    {stat.value}
                  </span>
                  <span className="statslabel">
                    {stat.label}
                  </span>
                </Motion.div>
              );
            })}
          </div>
        </Motion.div>
      </div>
    </section>
  );
}
