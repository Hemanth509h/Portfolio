import "./css/contact.css";
import { useForm } from "react-hook-form";
import { Mail, MapPin, Github, Linkedin, Instagram, Send } from "lucide-react";
import { motion as Motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { useState } from "react";

export function ContactSection() {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const [loading, setLoading] = useState(false);

  function onSubmit(data) {
    setLoading(true);

    emailjs
      .send(
        "service_v573mxk",     // 🔴 replace
        "template_4xehrtb",    // 🔴 replace
        {
          from_name: data.name,
          from_email: data.email,
          message: data.message,
        },
        "u7T_9mDN6lzVcXe5E"      // 🔴 replace
      )
      .then(() => {
        alert("Message sent successfully ✅");
        form.reset();
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to send ❌");
        setLoading(false);
      });
  }

  /* ================= ANIMATIONS ================= */

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const stagger = {
    show: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <section id="contact">
      <div className="container">

        {/* HEADING */}
        <Motion.div
          className="contact-heading"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <h2>Get In Touch</h2>
          <p>
            Looking for a developer to join your team or build your next project?
            Let's talk.
          </p>
        </Motion.div>

        <Motion.div
          className="contact-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >

          {/* LEFT SIDE */}
          <Motion.div className="glass-panel contact-info" variants={fadeUp}>
            <div>
              <h3>Contact Information</h3>

              <div className="info-item">
                <Mail />
                <div>
                  <p className="info-label">Email</p>
                  <p className="info-value">phemanthkumar509@gmail.com</p>
                </div>
              </div>

              <div className="info-item">
                <MapPin />
                <div>
                  <p className="info-label">Location</p>
                  <p className="info-value">Kphd , Hyderabad</p>
                </div>
              </div>
            </div>

            <div className="social">
              <p>Follow Me</p>
              <a href="https://github.com/Hemanth509h" target="_blank" rel="noopener noreferrer">
      <Github />
    </a>

    <a href="https://www.linkedin.com/in/peddaboinahemanthkumar/" target="_blank" rel="noopener noreferrer">
      <Linkedin />
    </a>
                <a href="https://www.instagram.com/hemanth_kumar_509/" target="_blank" rel="noopener noreferrer">
      <Instagram />
    </a>
            </div>
          </Motion.div>

          {/* RIGHT SIDE */}
          <Motion.div className="glass-panel contact-form" variants={fadeUp}>

            <form onSubmit={form.handleSubmit(onSubmit)}>

              <div className="form-row">

                {/* NAME */}
                <Motion.div variants={fadeUp}>
                  <label>Name</label>
                  <input
                    {...form.register("name", {
                      required: "Name is required",
                    })}
                    placeholder="John Doe"
                  />
                  <p className="error">
                    {form.formState.errors.name?.message}
                  </p>
                </Motion.div>

                {/* EMAIL */}
                <Motion.div variants={fadeUp}>
                  <label>Email</label>
                  <input
                    type="email"
                    {...form.register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email",
                      },
                    })}
                    placeholder="john@example.com"
                  />
                  <p className="error">
                    {form.formState.errors.email?.message}
                  </p>
                </Motion.div>

              </div>

              {/* MESSAGE */}
              <Motion.div variants={fadeUp}>
                <label>Message</label>
                <textarea
                  {...form.register("message", {
                    required: "Message is required",
                  })}
                  placeholder="How can I help you?"
                />
                <p className="error">
                  {form.formState.errors.message?.message}
                </p>
              </Motion.div>

              {/* BUTTON */}
              <Motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Send size={16} />
                {loading ? "Sending..." : "Send Message"}
              </Motion.button>

            </form>

          </Motion.div>

        </Motion.div>
      </div>
    </section>
  );
}
