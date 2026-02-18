"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

import faqData from "./faq1.json";
import styles from "./Faq1.module.css";

const Faq1 = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h3 className={styles.heading}>Frequently Asked Questions</h3>

        {faqData.map((item, index) => (
          <Question
            key={index}
            title={item.title}
            defaultOpen={item.defaultOpen}
          >
            {item.content}
          </Question>
        ))}
      </div>
    </div>
  );
};

const Question = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div
      animate={open ? "open" : "closed"}
      className={styles.question}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={styles.button}
      >
        <motion.span
          variants={{
            open: { opacity: 0.7 },
            closed: { opacity: 1 },
          }}
          transition={{ duration: 0.25 }}
          className={styles.title}
        >
          {title}
        </motion.span>

        <motion.span
          variants={{
            open: {
              rotate: 180,
              color: "var(--color-accent-start)",
            },
            closed: {
              rotate: 0,
              color: "var(--color-text-secondary)",
            },
          }}
          transition={{
            rotate: {
              type: "spring",
              stiffness: 380,
              damping: 22,
            },
          }}
          className={styles.icon}
        >
          <ChevronDown
            size={24}
            strokeWidth={2}
          />
        </motion.span>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
          marginBottom: open ? 24 : 0,
        }}
        transition={{ duration: 0.3 }}
        className={styles.answerWrapper}
      >
        <div className={styles.answer}>{children}</div>
      </motion.div>
    </motion.div>
  );
};

export default Faq1;
